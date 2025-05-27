
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-expense-light to-white p-4">
      <div className="text-center">
        <Logo size="lg" />
        
        <h1 className="mt-8 text-6xl font-bold text-expense-primary">404</h1>
        <p className="mt-4 text-xl text-gray-600 mb-8">Oops! We couldn't find that page.</p>
        
        <Link 
          to="/dashboard" 
          className="px-6 py-3 bg-expense-primary text-white rounded-lg font-medium hover:bg-expense-dark transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
