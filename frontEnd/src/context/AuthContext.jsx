import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { refreshToken, logout } from '../redux/slices/userSlice';
import axiosInstance from '../axiosInstance';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isRefreshing = useRef(false);

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url?.includes('/auth/refresh-token') ||
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/verify-otp')) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing.current) {
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          isRefreshing.current = true;

          try {
            const result = await dispatch(refreshToken()).unwrap();
            if (result.success) {
              isRefreshing.current = false;
              toast.success(result.message || 'Session refreshed');
              return axiosInstance(originalRequest);
            } else {
              isRefreshing.current = false;
              dispatch(logout());
              toast.error(result.message || 'Session expired. Please login again.');
              setTimeout(() => {
                navigate('/login');
              }, 500);
              return Promise.reject(error);
            }
          } catch (refreshError) {
            isRefreshing.current = false;
            dispatch(logout());
            toast.error('Session expired. Please login again.');
            setTimeout(() => {
              navigate('/login');
            }, 500);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [dispatch, navigate]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;