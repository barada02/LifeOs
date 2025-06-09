import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-blue-900 mb-3">LifeOS</h1>
        <p className="text-gray-600 text-xl max-w-lg">
          Your comprehensive life management system for organizing projects, tasks, habits, and goals.
        </p>
      </div>
      
      <AuthForm isLogin={isLogin} toggleForm={toggleForm} />
      
      <div className="mt-16 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} LifeOS. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;
