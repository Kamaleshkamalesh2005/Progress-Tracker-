import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import QuestionTracker from "./pages/dashboard/QuestionTracker";
import GitHubTracker from "./pages/dashboard/GitHubTracker";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 Progress Tracker Application Starting...');
    console.log('🔧 Environment:', {
      NODE_ENV: import.meta.env.MODE,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Missing'
    });
    
    // Add global error handler for deferred DOM node issues
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.message.includes('deferred DOM Node') || event.message.includes('DOM')) {
        console.warn('DOM manipulation error caught:', event.message);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError);
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
      console.log('✅ Application loaded successfully');
    }, 1000);

    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // Debug: Add error boundary
  try {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Progress Tracker...</p>
          </div>
        </div>
      );
    }

    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard/student" element={<StudentDashboard />} />
                <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/superadmin" element={<SuperAdminDashboard />} />
                <Route path="/dashboard/questions" element={<QuestionTracker />} />
                <Route path="/dashboard/github" element={<GitHubTracker />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('❌ App Error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Application Error</h1>
          <p className="text-muted-foreground">Please check the console for details</p>
          <pre className="mt-4 text-sm text-left bg-muted p-4 rounded">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      </div>
    );
  }
};

export default App;