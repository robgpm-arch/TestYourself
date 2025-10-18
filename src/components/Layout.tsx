import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  variant?: 'default' | 'centered' | 'fullscreen';
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className = '', 
  showHeader = true, 
  showFooter = true,
  variant = 'default'
}) => {
  const getLayoutClasses = () => {
    switch (variant) {
      case 'centered':
        return 'min-h-screen flex flex-col items-center justify-center';
      case 'fullscreen':
        return 'h-screen overflow-hidden';
      default:
        return 'min-h-screen flex flex-col';
    }
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Admin', to: '/admin', emphasis: 'text-blue-600 hover:text-blue-800 font-semibold' },
    { label: 'Motivation', to: '/motivational-hub', emphasis: 'text-teal-600 hover:text-teal-800 font-semibold' },
    { label: 'Challenges', to: '/daily-challenges', emphasis: 'text-amber-600 hover:text-amber-800 font-semibold' },
    { label: 'Friends', to: '/friends', emphasis: 'text-emerald-600 hover:text-emerald-800 font-semibold' },
    { label: 'Chat', to: '/chat', emphasis: 'text-sky-500 hover:text-sky-700 font-semibold' },
    { label: 'Lobby', to: '/lobby', emphasis: 'text-violet-400 hover:text-violet-600 font-semibold' },
    { label: 'Battle', to: '/battle', emphasis: 'text-cyan-400 hover:text-cyan-600 font-semibold' },
    { label: 'Results', to: '/challenge-result', emphasis: 'text-pink-400 hover:text-pink-600 font-semibold' },
    { label: 'Invite', to: '/invite', emphasis: 'text-teal-300 hover:text-teal-500 font-semibold' },
    { label: 'Achievements', to: '/achievement-celebration', emphasis: 'text-yellow-500 hover:text-yellow-700 font-semibold' },
    { label: 'Quizzes', to: '/chapter-sets' },
    { label: 'Exam Mode', to: '/exam-mode', emphasis: 'text-orange-600 hover:text-orange-800 font-semibold' },
    { label: 'Results', to: '/results-celebration', emphasis: 'text-purple-600 hover:text-purple-800 font-semibold' },
    { label: 'Analytics', to: '/detailed-analytics', emphasis: 'text-blue-600 hover:text-blue-800 font-semibold' },
    { label: 'Profile', to: '/profile' },
    { label: 'Settings', to: '/settings' }
  ];

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {showHeader && (
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img src="/assets/logo.png" alt="Logo" className="h-8 w-8" />
                <span className="ml-2 text-xl font-semibold text-gray-900">TestYourself</span>
              </Link>
              <nav className="hidden md:flex space-x-8">
                {navLinks.map(({ label, to, emphasis }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      [
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                        emphasis ?? 'text-gray-600 hover:text-gray-900',
                        isActive ? 'text-blue-600 font-semibold' : ''
                      ].join(' ')
                    }
                    end={to === '/'}
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </motion.header>
      )}

      <main className="flex-1 w-full">
        {children}
      </main>

      {showFooter && (
        <motion.footer 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-50 border-t border-gray-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">TestYourself</h3>
                <p className="text-gray-600 text-sm">Challenge your knowledge with interactive quizzes and assessments.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">Home</Link></li>
                  <li><Link to="/chapter-sets" className="text-gray-600 hover:text-gray-900 text-sm">Quizzes</Link></li>
                  <li><Link to="/leaderboards" className="text-gray-600 hover:text-gray-900 text-sm">Leaderboard</Link></li>
                  <li><Link to="/settings" className="text-gray-600 hover:text-gray-900 text-sm">Support</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Connect</h3>
                <div className="flex space-x-4">
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-lg">📱</span>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-lg">💌</span>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-lg">🌐</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-400 text-sm">© 2025 TestYourself. All rights reserved.</p>
            </div>
          </div>
        </motion.footer>
      )}
    </div>
  );
};

export default Layout;