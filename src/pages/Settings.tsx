import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import Button from '../components/Button';
import ResponsiveGrid from '../components/ResponsiveGrid';

const Settings: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Settings categories with card styling
  const settingsCategories = [
    {
      id: 'language',
      title: 'Language & Region',
      subtitle: 'Change app language & board preferences',
      icon: '🌐',
      color: 'from-teal-400 to-teal-600',
      hoverColor: 'hover:from-teal-500 hover:to-teal-700'
    },
    {
      id: 'theme',
      title: 'Theme & Appearance',
      subtitle: 'Light / Dark / Custom themes',
      icon: '🎨',
      color: 'from-purple-400 to-purple-600',
      hoverColor: 'hover:from-purple-500 hover:to-purple-700'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Daily reminders & quiz alerts',
      icon: '🔔',
      color: 'from-orange-400 to-orange-600',
      hoverColor: 'hover:from-orange-500 hover:to-orange-700'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage permissions & data sharing',
      icon: '🔒',
      color: 'from-red-400 to-red-600',
      hoverColor: 'hover:from-red-500 hover:to-red-700'
    },
    {
      id: 'account',
      title: 'Account',
      subtitle: 'Profile, login methods, subscription',
      icon: '⚡',
      color: 'from-blue-400 to-blue-600',
      hoverColor: 'hover:from-blue-500 hover:to-blue-700'
    },
    {
      id: 'support',
      title: 'Help & Support',
      subtitle: 'Contact us or read FAQs',
      icon: '❓',
      color: 'from-green-400 to-green-600',
      hoverColor: 'hover:from-green-500 hover:to-green-700'
    }
  ];

  const handleCardClick = (cardId: string) => {
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  const IconGlow: React.FC<{ icon: string; isSelected: boolean }> = ({ icon, isSelected }) => (
    <div className="relative">
      <span className={`text-4xl transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}>
        {icon}
      </span>
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-white/30 rounded-full blur-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.2 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );

  return (
    <Layout>
      {/* Animated Background */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {/* Background icons */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-6xl">⚙️</div>
          <div className="absolute top-40 right-20 text-5xl">🎚️</div>
          <div className="absolute bottom-40 left-20 text-4xl">⚙️</div>
          <div className="absolute bottom-20 right-10 text-5xl">🎚️</div>
          <div className="absolute top-60 left-1/3 text-4xl">⚙️</div>
          <div className="absolute bottom-60 right-1/3 text-4xl">🎚️</div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Settings</h1>
            <p className="text-xl text-gray-600">Customize your learning experience</p>
          </motion.div>

          {/* Settings Cards Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap={6} className="mb-12">
              {settingsCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer"
                  onClick={() => handleCardClick(category.id)}
                >
                  <div className={`relative h-48 rounded-2xl bg-gradient-to-br ${category.color} ${category.hoverColor} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                    {/* Card Content */}
                    <div className="relative z-10 h-full p-6 flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                        <IconGlow 
                          icon={category.icon} 
                          isSelected={selectedCard === category.id} 
                        />
                        {selectedCard === category.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/20 rounded-full p-2"
                          >
                            <span className="text-white text-sm">✓</span>
                          </motion.div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          {category.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-all duration-300" />
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/5 rounded-full blur-lg" />
                  </div>
                </motion.div>
              ))}
            </ResponsiveGrid>
          </motion.div>

          {/* Expanded Card Details */}
          <AnimatePresence>
            {selectedCard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                  {selectedCard === 'language' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-3xl">🌐</span>
                        Language & Region Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">App Language</label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Tamil</option>
                            <option>Telugu</option>
                            <option>Bengali</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Board Preference</label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                            <option>CBSE</option>
                            <option>ICSE</option>
                            <option>State Board</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCard === 'theme' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-3xl">🎨</span>
                        Theme & Appearance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {['Light', 'Dark', 'Auto'].map((theme) => (
                          <div key={theme} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 cursor-pointer transition-colors">
                            <div className="text-center">
                              <div className={`w-16 h-16 mx-auto mb-3 rounded-lg ${theme === 'Light' ? 'bg-white border' : theme === 'Dark' ? 'bg-gray-800' : 'bg-gradient-to-br from-white to-gray-800'}`}></div>
                              <span className="font-medium text-gray-700">{theme}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Color Accent</label>
                        <div className="flex gap-3">
                          {['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500'].map((color) => (
                            <div key={color} className={`w-10 h-10 ${color} rounded-full cursor-pointer hover:scale-110 transition-transform`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCard === 'notifications' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-3xl">🔔</span>
                        Notification Preferences
                      </h3>
                      <div className="space-y-4">
                        {[
                          { title: 'Daily Study Reminders', subtitle: 'Get notified to maintain your study streak' },
                          { title: 'Quiz Alerts', subtitle: 'New quizzes and practice sessions available' },
                          { title: 'Achievement Notifications', subtitle: 'Celebrate your learning milestones' },
                          { title: 'Weekly Progress Reports', subtitle: 'Summary of your learning progress' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              <p className="text-sm text-gray-600">{item.subtitle}</p>
                            </div>
                            <div className="bg-orange-500 relative inline-flex h-6 w-11 items-center rounded-full">
                              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCard === 'privacy' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-3xl">🔒</span>
                        Privacy & Security
                      </h3>
                      <div className="space-y-4">
                        {[
                          { title: 'Profile Visibility', subtitle: 'Control who can see your profile and progress' },
                          { title: 'Data Sharing', subtitle: 'Manage how your learning data is used' },
                          { title: 'Analytics', subtitle: 'Help improve the app with anonymous usage data' },
                          { title: 'Third-party Integrations', subtitle: 'Control external app connections' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              <p className="text-sm text-gray-600">{item.subtitle}</p>
                            </div>
                            <div className="bg-red-500 relative inline-flex h-6 w-11 items-center rounded-full">
                              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCard === 'account' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-3xl">⚡</span>
                        Account Management
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Name</label>
                            <input 
                              type="text" 
                              defaultValue="Priya Sharma"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input 
                              type="email" 
                              defaultValue="priya@example.com"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-xl">
                            <h4 className="font-medium text-blue-900 mb-2">Subscription Status</h4>
                            <p className="text-blue-700 text-sm">Premium Plan - NEET 2025</p>
                            <button className="text-blue-600 text-sm font-medium hover:underline mt-2">Manage Subscription</button>
                          </div>
                          <div className="space-y-2">
                            <button className="w-full text-left p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                              <span className="font-medium text-gray-900">Change Password</span>
                            </button>
                            <button className="w-full text-left p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                              <span className="font-medium text-gray-900">Login Methods</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCard === 'support' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-3xl">❓</span>
                        Help & Support
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { title: 'Help Center', subtitle: 'Browse FAQs and guides', icon: '📚' },
                          { title: 'Contact Support', subtitle: 'Get in touch with our team', icon: '💬' },
                          { title: 'Report a Bug', subtitle: 'Let us know about issues', icon: '🐛' },
                          { title: 'Feature Request', subtitle: 'Suggest new features', icon: '💡' }
                        ].map((item, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{item.icon}</span>
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{item.subtitle}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center space-y-4"
          >
            <Button variant="outline" size="large" className="mx-auto">
              Restore Defaults
            </Button>
            <p className="text-gray-500 text-sm">
              TestYourself App v1.2.3 • Built for NEET 2025 Preparation
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;