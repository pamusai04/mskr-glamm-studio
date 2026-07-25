import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Search, ChevronLeft, ChevronRight, Phone, Calendar, RefreshCw, X, Mail, Users } from 'lucide-react';
import { fetchAllUsers } from '../../../redux/slices/adminUsersSlice';
import toast from 'react-hot-toast';
import AdminLoading from '../../../common/AdminLoading';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';

const UsersSection = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.adminUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 10;
  
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    if (!searchTerm) return users;
    
    const searchLower = searchTerm.toLowerCase();
    return users.filter(user =>
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.emailId?.toLowerCase().includes(searchLower) ||
      user.phoneNumber?.toLowerCase().includes(searchLower)
    );
  }, [users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const toastId = toast.loading('Refreshing users...');
    try {
      await dispatch(fetchAllUsers()).unwrap();
      toast.success('Users refreshed successfully', { id: toastId });
      setCurrentPage(1);
      setSearchTerm('');
    } catch (error) {
      toast.error('Failed to refresh users', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    toast.success('Filters cleared');
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading && !users.length) {
    return <AdminLoading text="Loading users" icon={Users} color="emerald" />;
  }

  if (error && !users.length) {
    return (
      <ErrorState 
        error={error}
        onRetry={handleRefresh}
        title="Failed to Load Users"
        icon="alert"
        showRetry={true}
      />
    );
  }

  if (!loading && users && users.length === 0) {
    return (
      <EmptyState 
        title="No Users Found"
        message="There are no users registered at this moment."
        icon="default"
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all registered users</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
          />
        </div>
      </div>

      {searchTerm && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{paginatedUsers.length}</span> of{' '}
            <span className="font-medium text-gray-900">{filteredUsers.length}</span> users
          </div>
          <button
            onClick={resetFilters}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {filteredUsers.length === 0 && searchTerm ? (
        <EmptyState
          title="No users found"
          message="Try adjusting your search criteria"
          icon="search"
          showAction={false}
        />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bookings</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Spent</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created At</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            {user.profilePhoto?.url ? (
                              <img src={user.profilePhoto.url} alt={user.fullName} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <span className="text-emerald-600 font-semibold text-sm">
                                {user.fullName?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.emailId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{user.phoneNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900">Total: {user.totalBookings || 0}</div>
                          <div className="flex gap-3 text-xs">
                            <span className="text-green-600">✓ {user.completedBookings || 0}</span>
                            <span className="text-red-600">✗ {user.cancelledBookings || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-emerald-600">₹{(user.totalSpent || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{new Date(user.joinedDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4 inline mr-1" />
                Previous
              </button>
              
              <div className="flex gap-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-emerald-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          )}
        </>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shrink-0">
                  {selectedUser.profilePhoto?.url ? (
                    <img src={selectedUser.profilePhoto.url} alt={selectedUser.fullName} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {selectedUser.fullName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedUser.fullName}</h2>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    {selectedUser.emailId}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedUser.phoneNumber || 'No phone number'}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                    selectedUser.isActive 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-emerald-600 font-medium">Total Bookings</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{selectedUser.totalBookings || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-600 font-medium">Completed</p>
                  <p className="text-xl font-bold text-green-700 mt-1">{selectedUser.completedBookings || 0}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-red-600 font-medium">Cancelled</p>
                  <p className="text-xl font-bold text-red-700 mt-1">{selectedUser.cancelledBookings || 0}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-600 font-medium">Total Spent</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">₹{(selectedUser.totalSpent || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">Account Created</p>
                <p className="text-sm text-gray-900 font-medium mt-1">{new Date(selectedUser.joinedDate).toLocaleString()}</p>
              </div>

              {selectedUser.lastActive && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium">Last Active</p>
                  <p className="text-sm text-gray-900 font-medium mt-1">{new Date(selectedUser.lastActive).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersSection;