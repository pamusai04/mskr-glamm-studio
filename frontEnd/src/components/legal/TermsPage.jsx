import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Lock, CheckCircle, AlertCircle, Calendar, Users, Clock } from 'lucide-react';

const TermsPage = memo(() => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/register" 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-pink-500" />
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 mt-1">Last updated: January 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-pink-500" />
              1. Acceptance of Terms
            </h2>
            <p className="text-sm leading-relaxed">
              By using MSKR GLAMM STUDIO's services, you agree to these Terms of Service. 
              If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-pink-500" />
              2. User Accounts
            </h2>
            <p className="text-sm leading-relaxed">
              To book services, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-sm ml-4 space-y-1 mt-2 text-gray-600">
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Keeping your account information up to date</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              3. Booking Process
            </h2>
            <p className="text-sm leading-relaxed mb-2">
              To confirm your booking, please follow these steps:
            </p>
            <ul className="list-disc list-inside text-sm ml-4 space-y-1 text-gray-600">
              <li>Fill out the booking form with your details</li>
              <li>A confirmation call will be made by our service provider</li>
              <li>Your booking will be confirmed after the call</li>
              <li>Half payment is required after booking confirmation</li>
              <li>Remaining payment is due in person at the time of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-500" />
              4. Appointment Policies
            </h2>
            <ul className="list-disc list-inside text-sm ml-4 space-y-1 text-gray-600">
              <li>Please arrive 10-15 minutes before your appointment</li>
              <li>Late arrivals may result in reduced service time</li>
              <li>Half payment is required to secure your booking</li>
              <li>Remaining balance is payable in person</li>
              <li>Payment methods: Cash, UPI, or Bank Transfer</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-pink-500" />
              5. Privacy & Data Protection
            </h2>
            <p className="text-sm leading-relaxed">
              Your privacy is important to us. We collect and process your data in accordance 
              with our Privacy Policy. We use your information to:
            </p>
            <ul className="list-disc list-inside text-sm ml-4 space-y-1 mt-2 text-gray-600">
              <li>Process your bookings</li>
              <li>Send appointment confirmations and reminders</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-pink-500" />
              6. Changes to Terms
            </h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to update these terms at any time. Continued use of 
              our services constitutes acceptance of the updated terms. We will notify 
              users of any significant changes via email or through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-pink-500" />
              7. Contact Us
            </h2>
            <p className="text-sm leading-relaxed">
              If you have any questions about these terms, please contact us at:
            </p>
            <div className="mt-2 text-sm text-gray-600">
              <p>📧 Email: <a href="mailto:mskr.glammstudio@gmail.com" className="text-pink-500 hover:underline">mskr.glammstudio@gmail.com</a></p>
              <p>📞 Phone: <a href="tel:+919133293879" className="text-pink-500 hover:underline">+91 9133293879</a></p>
            </div>
          </section>

          <div className="border-t border-gray-200 pt-4 mt-6">
            <p className="text-xs text-gray-400 text-center">
              By using MSKR GLAMM STUDIO's services, you agree to these terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

TermsPage.displayName = 'TermsPage';
export default TermsPage;