import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Phone, Key, CheckCircle2 } from 'lucide-react';

const PrivacyPage = memo(() => {
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
              <Shield className="w-6 h-6 text-pink-500" />
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 mt-1">Last updated: January 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-pink-500" />
              Your Privacy Matters
            </h2>
            <p className="text-sm leading-relaxed">
              At MSKR GLAMM STUDIO, we take your privacy seriously. This policy explains how we 
              collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-pink-500" />
              Information We Collect
            </h2>
            <p className="text-sm leading-relaxed mb-2">We collect the following information:</p>
            <ul className="list-disc list-inside text-sm ml-4 space-y-1 text-gray-600">
              <li>Full Name</li>
              <li>Email Address</li>
              <li>Phone Number</li>
              <li>Booking Preferences</li>
              <li>Service History</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5 text-pink-500" />
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-sm ml-4 space-y-1 text-gray-600">
              <li>Process and confirm your bookings</li>
              <li>Send appointment reminders and confirmations</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-pink-500" />
              Data Security
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              We use <strong>JWT (JSON Web Tokens)</strong> for secure authentication. 
              This means your data is protected through:
            </p>
            <div className="space-y-2 ml-2">
              {[
                "Your login session is secured with encrypted tokens",
                "Tokens automatically expire after a set time for additional security",
                "Your password is hashed and stored securely using industry standards",
                "Only authenticated users can access their personal data"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-pink-500" />
              Data Protection
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              We implement standard security practices to protect your data:
            </p>
            <div className="space-y-2 ml-2">
              {[
                "All data is transmitted over HTTPS (secure connection)",
                "Passwords are encrypted using industry-standard hashing",
                "Access to user data requires valid JWT authentication",
                "We regularly update and review our security practices"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-500" />
              Your Rights
            </h2>
            <p className="text-sm leading-relaxed mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-sm ml-4 space-y-1 text-gray-600">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Phone className="w-5 h-5 text-pink-500" />
              Contact Us
            </h2>
            <p className="text-sm leading-relaxed">
              For privacy-related questions or concerns, please contact us:
            </p>
            <div className="mt-2 text-sm text-gray-600">
              <p>📧 Email: <a href="mailto:mskr.glammstudio@gmail.com" className="text-pink-500 hover:underline">mskr.glammstudio@gmail.com</a></p>
              <p>📞 Phone: <a href="tel:+919133293879" className="text-pink-500 hover:underline">+91 9133293879</a></p>
            </div>
          </section>

          <div className="border-t border-gray-200 pt-4 mt-6">
            <p className="text-xs text-gray-400 text-center">
              We are committed to protecting your privacy and ensuring a safe experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

PrivacyPage.displayName = 'PrivacyPage';
export default PrivacyPage;