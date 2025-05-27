
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const API_URL = import.meta.env.VITE_BACKEND_URL;
const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard page after showing the logo briefly
    console.log("Into Index to go to dashboard")
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-expense-light to-white">
      <div className="animate-scale-in">
        <Logo size="xl" />
        <p className="mt-6 text-lg text-center text-gray-600 animate-pulse-opacity">
          Loading your expense manager...
        </p>
      </div>
    </div>
  );
};

export default Index;
