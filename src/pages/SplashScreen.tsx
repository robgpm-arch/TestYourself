import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import logo from '../assets/logo.png';
import adminIcon from '../assets/admin-icon.png';
import AuthService from '../services/authService';
import { isFirebaseConfigured } from '../config/firebase';
import RegisterDialog from '../components/RegisterDialog';

interface SplashScreenProps {
  onAdmin: () => void;
  onRegister: () => void;
  onLogin: () => void;
  onUserInteracted?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAdmin, onRegister, onLogin, onUserInteracted }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configWarning, setConfigWarning] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleAdminAccess = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!adminEmail || !adminPassword) {
      setAdminError('Please enter both email and password.');
      return;
    }

    if (!isFirebaseConfigured) {
      setConfigWarning('Admin sign-in is disabled because Firebase credentials are not configured.');
      return;
    }

    try {
      setIsSubmitting(true);
      setAdminError(null);
      setConfigWarning(null);

      // Firebase authentication (App Check handles security automatically)
      const { firebaseUser } = await AuthService.signInWithEmail(adminEmail.trim(), adminPassword);
      await firebaseUser.getIdToken(true);
      const tokenResult = await firebaseUser.getIdTokenResult(true);

      if (!tokenResult.claims?.admin) {
        setAdminError('This account does not have admin privileges.');
        await AuthService.signOutUser();
        return;
      }

      // Set local redirect hint for development
      if (process.env.NODE_ENV !== 'production') {
        localStorage.setItem('admin_authenticated', 'true');
      }

      onAdmin();
      setShowAdminLogin(false);
      setAdminEmail('');
      setAdminPassword('');
    } catch (error: any) {
      const message = error?.message ?? 'Unable to sign in as admin. Please verify your credentials.';
      setAdminError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-violet-700 text-[90%] sm:text-[95%]">
      {/* Abstract Wave Background */}
      <div className="absolute inset-0">
        <svg className="absolute bottom-0 w-full h-64 opacity-30" viewBox="0 0 1200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,160L48,186.7C96,213,192,267,288,261.3C384,256,480,192,576,181.3C672,171,768,213,864,218.7C960,224,1056,192,1152,181.3L1200,176V320H1152C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0V160Z" fill="url(#wave1)"/>
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
          </defs>
        </svg>
        
        <svg className="absolute bottom-16 w-full h-48 opacity-20" viewBox="0 0 1200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,64L48,85.3C96,107,192,149,288,149.3C384,149,480,107,576,112C672,117,768,171,864,181.3C960,192,1056,160,1152,138.7L1200,128V320H1152C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0V64Z" fill="url(#wave2)"/>
          <defs>
            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Admin Login Icon - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setShowAdminLogin(!showAdminLogin)}
          className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-110"
        >
          <img src={adminIcon} alt="Admin" className="w-6 h-6" />
        </button>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
              <p className="text-gray-600">Manage courses, subjects, chapters & content</p>
            </div>
            <form className="space-y-4" onSubmit={handleAdminAccess}>
              <div>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  placeholder="Admin Email"
                  autoComplete="username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  placeholder="Admin Password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              {configWarning && (
                <p className="text-sm text-amber-600">
                  {configWarning}
                </p>
              )}
              {adminError && (
                <p className="text-sm text-red-600">
                  {adminError}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In…' : 'Access Admin Panel'}
              </button>
              {isSubmitting && (
                <p className="text-xs text-gray-500 text-center">
                  Verifying admin access…
                </p>
              )}
            </form>
            <button 
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 py-4 sm:py-6 items-center">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 w-full max-w-lg text-center">
          {/* Logo and App Name Section */}
          <div className="space-y-2 sm:space-y-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-lg p-1.5">
              <img src={logo} alt="TestYourself Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-[2.25rem] font-bold text-white">TestYourself</h1>
              <p className="text-[0.8rem] sm:text-sm md:text-base text-blue-100 opacity-90">Challenge Your Knowledge</p>
            </div>
          </div>

          {/* Center Illustration with Floating Icons */}
          <div className="relative flex items-center justify-center">
            <div className="relative">
              <img 
                src="https://public.youware.com/users-website-assets/prod/a9adc6a9-2f03-4873-86f9-880d7d00e957/e44d6f08d8b644b18fbf7166e02b7ca3.jpg" 
                alt="Student studying with books"
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain"
              />
            </div>
            
            {/* Floating Icons with Animation */}
            <div className="absolute -top-4 -left-6 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>
              <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-base">💡</span>
              </div>
            </div>
            
            <div className="absolute -top-3 right-0 animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}>
              <div className="w-9 h-9 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-base">✅</span>
              </div>
            </div>
            
            <div className="absolute bottom-0 -right-4 animate-bounce" style={{animationDelay: '2s', animationDuration: '3s'}}>
              <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm">❓</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
           <button
             className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow hover:shadow-md"
             onClick={onRegister}
           >
             Register
           </button>

           <button
             onClick={onLogin}
             className="rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-900 hover:bg-gray-200"
           >
             Login
           </button>
         </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-yellow-300 rounded-full opacity-70 animate-pulse"></div>
      <div className="absolute top-32 right-16 w-3 h-3 bg-pink-300 rounded-full opacity-70 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-20 w-5 h-5 bg-cyan-300 rounded-full opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-60 right-10 w-2 h-2 bg-green-300 rounded-full opacity-70 animate-pulse" style={{animationDelay: '0.5s'}}></div>

      <RegisterDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default SplashScreen;