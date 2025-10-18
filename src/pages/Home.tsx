import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import ResponsiveGrid from '../components/ResponsiveGrid';

const Home: React.FC = () => {
  const stats = [
    { label: 'Quizzes Completed', value: '127', icon: '📚' },
    { label: 'Points Earned', value: '2,450', icon: '⭐' },
    { label: 'Current Streak', value: '7 days', icon: '🔥' },
    { label: 'Rank', value: '#42', icon: '🏆' }
  ];

  const recentQuizzes = [
    { 
      title: 'JavaScript Fundamentals', 
      category: 'Programming', 
      score: '85%', 
      time: '2 hours ago',
      difficulty: 'Intermediate',
      color: 'from-yellow-400 to-orange-500'
    },
    { 
      title: 'World History Quiz', 
      category: 'History', 
      score: '92%', 
      time: '1 day ago',
      difficulty: 'Easy',
      color: 'from-green-400 to-emerald-500'
    },
    { 
      title: 'Advanced Mathematics', 
      category: 'Math', 
      score: '78%', 
      time: '3 days ago',
      difficulty: 'Hard',
      color: 'from-purple-400 to-indigo-500'
    },
    { 
      title: 'Science & Nature', 
      category: 'Science', 
      score: '90%', 
      time: '5 days ago',
      difficulty: 'Intermediate',
      color: 'from-blue-400 to-cyan-500'
    }
  ];

  const categories = [
    { name: 'Programming', count: 45, icon: '💻', color: 'bg-blue-500' },
    { name: 'Mathematics', count: 32, icon: '📊', color: 'bg-purple-500' },
    { name: 'Science', count: 28, icon: '🧪', color: 'bg-green-500' },
    { name: 'History', count: 21, icon: '📜', color: 'bg-yellow-500' },
    { name: 'Literature', count: 18, icon: '📖', color: 'bg-pink-500' },
    { name: 'Geography', count: 15, icon: '🗺️', color: 'bg-indigo-500' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, Alex! 👋</h1>
                <p className="text-blue-100 text-lg">Ready to challenge yourself with new quizzes?</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Start New Quiz
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Progress</h2>
          <ResponsiveGrid cols={{ default: 2, md: 4 }} gap={4}>
            {stats.map((stat, index) => (
              <Card key={index} variant="elevated" padding="medium">
                <div className="text-center">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        </motion.div>

        {/* Recent Quizzes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View All →</button>
          </div>
          <ResponsiveGrid cols={{ default: 1, md: 2 }} gap={4}>
            {recentQuizzes.map((quiz, index) => (
              <Card key={index} variant="default" hover>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${quiz.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {quiz.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{quiz.title}</h3>
                    <p className="text-sm text-gray-600">{quiz.category} • {quiz.difficulty}</p>
                    <p className="text-xs text-gray-500">{quiz.time}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="text-lg">▶️</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        </motion.div>

        {/* Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Categories</h2>
          <ResponsiveGrid cols={{ default: 2, sm: 3, lg: 6 }} gap={4}>
            {categories.map((category, index) => (
              <Card key={index} variant="default" hover onClick={() => console.log(`Selected ${category.name}`)}>
                <div className="text-center">
                  <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-white text-xl">{category.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-600">{category.count} quizzes</p>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 mb-8"
        >
          <Card variant="gradient" padding="large">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ready for a Challenge?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-colors"
                >
                  Random Quiz
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.hash = '#/chapter-sets'}
                  className="bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
                >
                  📚 Chapter Sets
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;