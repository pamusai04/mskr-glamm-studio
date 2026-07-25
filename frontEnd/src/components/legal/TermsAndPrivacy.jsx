import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Lock, CheckCircle } from 'lucide-react';

const TermsAndPrivacy = memo(() => {
  return (
    <div className="space-y-2">
      {/* Terms and Privacy Links */}
      <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-gray-500">
        <span>By signing up, you agree to our</span>
        <Link 
          to="/terms" 
          className="text-pink-500 hover:text-pink-600 hover:underline transition-colors font-medium flex items-center gap-1"
        >
          <FileText className="w-3 h-3" />
          Terms of Service
        </Link>
        <span>and</span>
        <Link 
          to="/privacy" 
          className="text-pink-500 hover:text-pink-600 hover:underline transition-colors font-medium flex items-center gap-1"
        >
          <Shield className="w-3 h-3" />
          Privacy Policy
        </Link>
      </div>

      
    </div>
  );
});

TermsAndPrivacy.displayName = 'TermsAndPrivacy';
export default TermsAndPrivacy;