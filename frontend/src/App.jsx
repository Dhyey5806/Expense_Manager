import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import axios from 'axios';

// Import Components
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import AuthForm from './components/AuthForm';

// Import Pages
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import UpdateExpense from './pages/UpdateExpense';
import ViewExpense from './pages/ViewExpense';
import AIAnalysis from './pages/AIAnalysis';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import Friends from './pages/Friends';
import CreateGroup from './pages/CreateGroup';
import MyGroups from './pages/MyGroups';
import Chat from './pages/Chat';
import Result from './pages/Result';

const queryClient = new QueryClient();

const API_URL = import.meta.env.VITE_BACKEND_URL;
const GroupMember = ({ children }) => {

  const { id: groupId } = useParams();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkGroupMembership = async () => {
      try {
        console.log("Here to check from frontedn that user is memeb of group")
        const res = await axios.get(`${API_URL}/group/${groupId}`, {
          withCredentials: true,
        });
        if (res.data.authorized) {
          setAuthorized(true);
        } else {
          toast("You are not member of this Group :)")
          navigate('/dashboard');
        }
      } catch (error) {
        toast("You are not member of this Group :)")
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkGroupMembership();
  }, [groupId, navigate]);

  if (loading) return <LoadingScreen />;
  return authorized ? children : null;
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);
  
  const RouteChangeHandler = ({ children }) => {
    const [isChanging, setIsChanging] = useState(true);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsChanging(false);
      }, 800);
      return () => clearTimeout(timer);
    }, []);
    
    if (isChanging) return <LoadingScreen />;
    return children;
  };

  const ProtectedRoute = ({ children }) => {
    const [isVerifying, setVerifying] = useState(true);

    useEffect(() => {
      const verifyUser = async () => {
        try {
          console.log("From frontend sending checking req for token to backend");
          console.log(API_URL);
          const response = await axios.get(`${API_URL}/verify`, {
            withCredentials: true,
          });
          setIsAuthenticated(response.data?.verified === true);
        } catch (error) {
          setIsAuthenticated(false);
        } finally {
          setVerifying(false);
        }
      };

      verifyUser();
    }, []);

    if (isVerifying) return <LoadingScreen />;
    if (!isAuthenticated) {
      console.log("Hve ame jaishu Login pase yayay");
      return <Navigate to="/login" />;
    }

    return (
      <>
        <Navbar />
        <RouteChangeHandler>
          {children}
        </RouteChangeHandler>
      </>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthForm isLogin={true} />} />
            <Route path="/signup" element={<AuthForm isLogin={false} />} />
            <Route path="/" element={<Index />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="/add" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
            <Route path="/update" element={<ProtectedRoute><UpdateExpense /></ProtectedRoute>} />
            <Route path="/view" element={<ProtectedRoute><ViewExpense /></ProtectedRoute>} />
            <Route path="/ai-analysis" element={<ProtectedRoute><AIAnalysis /></ProtectedRoute>} />
            <Route path="/create/groups" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
            <Route path="/mygroups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
            <Route path="/mygroups/:id" element={<ProtectedRoute><GroupMember><Chat /></GroupMember></ProtectedRoute>} />
            <Route path="/mygroups/results/:id" element={<ProtectedRoute><GroupMember><Result /></GroupMember></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
