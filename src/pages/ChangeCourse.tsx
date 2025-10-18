import React from 'react';

const ChangeCourse: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Change Course</h1>
        <p className="text-gray-600 mb-6">
          This feature is coming soon! You'll be able to switch between different courses and
          subjects here.
        </p>
        <div className="text-4xl mb-4">🚧</div>
        <p className="text-sm text-gray-500">Check back later for updates.</p>
      </div>
    </div>
  );
};

export default ChangeCourse;
