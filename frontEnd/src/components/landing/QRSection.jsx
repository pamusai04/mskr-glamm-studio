import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { QrCode, Share2, Download, Copy, Check, Smartphone, Users, Send, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const QRCodeSection = memo(() => {
  const { qrCode } = useSelector((state) => state.landingPage);
  const [imageError, setImageError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!qrCode) {
    return null;
  }

  const handleShare = async () => {
    if (!qrCode || !qrCode.qrImage) {
      toast.error('QR code not available');
      return;
    }

    try {
      if (navigator.share) {
        const response = await fetch(qrCode.qrImage);
        const blob = await response.blob();
        const file = new File([blob], 'msk-makeover-qr.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'MSKR GLAMM STUDIO',
          text: 'Check out MSKR GLAMM STUDIO - Book your appointment now! ✨ Share with your friends and family!',
          files: [file]
        });
        toast.success('Shared successfully! 🎉');
      } else {
        await navigator.clipboard.writeText(qrCode.qrImage);
        setIsCopied(true);
        toast.success('QR code URL copied! Share it with your friends! 📤');
        setTimeout(() => setIsCopied(false), 3000);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(qrCode.qrImage);
          setIsCopied(true);
          toast.success('QR code URL copied! Share it with your friends! 📤');
          setTimeout(() => setIsCopied(false), 3000);
        } catch (clipboardError) {
          toast.error('Failed to share QR code. Please try again.');
        }
      }
    }
  };

  const handleDownload = async () => {
    if (!qrCode || !qrCode.qrImage) {
      toast.error('QR code not available');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(qrCode.qrImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'msk-makeover-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR code downloaded! Share it with your friends! 📱');
    } catch (error) {
      toast.error('Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode.qrImage);
      setIsCopied(true);
      toast.success('QR code URL copied! Share it with your friends and family! 📤');
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <section id="qr-section" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-4">
            <Users className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-600">Share with Friends & Family</span>
          </div>
          <h2
            className="font-bold text-2xl md:text-3xl  text-gray-800 mb-3"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            Share MSKR GLAMM STUDIO with Everyone! 🎉
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto">
            Share this QR code with your friends, family, and colleagues so they can easily book their appointments too!
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-violet-400 to-purple-500 mx-auto rounded-full mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* QR Code Display */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="flex justify-center"
          >
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-50 rounded-xl flex items-center justify-center p-4">
                {!imageError ? (
                  <img 
                    src={qrCode.qrImage} 
                    alt="MSKR GLAMM STUDIO QR Code" 
                    className="w-full h-full object-contain"
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <QrCode className="w-20 h-20 mx-auto mb-3" />
                    <p className="text-sm">QR Code not available</p>
                  </div>
                )}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-violet-500/10 rounded-full blur-xl" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-purple-500/10 rounded-full blur-xl" />
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  📱 Scan to visit MSKR GLAMM STUDIO
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                Share the Beauty! 💫
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Share this QR code with your friends, family, and colleagues. They can scan and visit MSKR GLAMM STUDIO instantly!
              </p>
            </div>

            {/* How to Share - 3 Simple Steps */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-violet-500" />
                How to Share with Friends & Family
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-violet-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Click "Share QR" Button</p>
                    <p className="text-xs text-gray-400">Share via WhatsApp, Instagram, or any app</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-violet-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Download & Send</p>
                    <p className="text-xs text-gray-400">Download the QR code image and share it</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-violet-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Copy & Paste URL</p>
                    <p className="text-xs text-gray-400">Copy the QR code URL and share anywhere</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-md shadow-violet-200"
              >
                <Share2 className="w-4 h-4" />
                Share QR
              </motion.button>

              <motion.button
                onClick={handleDownload}
                disabled={isDownloading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 border border-gray-200 shadow-sm"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </motion.button>

              <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 border border-gray-200 shadow-sm"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy URL
                  </>
                )}
              </motion.button>
            </div>

            {/* Quick Share Info */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                📤 Share with friends on WhatsApp, Instagram, or any messaging app!
              </p>
            </div>
          </motion.div>
        </div>

        {/* Share Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.2 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <h5 className="text-sm font-semibold text-gray-700 mb-1">Easy to Share</h5>
            <p className="text-xs text-gray-400">Share instantly via any app</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <h5 className="text-sm font-semibold text-gray-700 mb-1">Scan & Visit</h5>
            <p className="text-xs text-gray-400">Friends scan and visit website</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h5 className="text-sm font-semibold text-gray-700 mb-1">Spread the Word</h5>
            <p className="text-xs text-gray-400">Help friends discover MSKR GLAMM STUDIO</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

QRCodeSection.displayName = 'QRCodeSection';

export default QRCodeSection;