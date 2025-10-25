import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, User } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: string, additionalData?: { rollNumber?: string; department?: string; section?: string; year?: string; college_name?: string; college_id?: string }) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔐 Initializing authentication...');
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        console.log('✅ User authenticated:', { id: currentUser.id, role: currentUser.role });
        setUser(currentUser);
        setUserRole(currentUser.role);
      } else {
        console.log('ℹ️ No authenticated user found');
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string, additionalData?: { rollNumber?: string; department?: string; section?: string; year?: string; college_name?: string; college_id?: string }) => {
    try {
      console.log('🔐 Signing up user...', { email, role, additionalData });
      setLoading(true);

      const result = await AuthService.signup({
        email,
        password,
        name,
        role: role as 'ADMIN' | 'STUDENT' | 'SUPER_ADMIN' | 'TEACHER',
        rollNumber: additionalData?.rollNumber,
        department: additionalData?.department,
        section: additionalData?.section,
        year: additionalData?.year,
        college_name: additionalData?.college_name,
        college_id: additionalData?.college_id
      });
      
      if (result.success && result.user) {
        // Only set user if they are approved (not pending)
        if (result.user.status === 'approved') {
          setUser(result.user);
          setUserRole(result.user.role);
          console.log('✅ Sign up successful:', { role: result.user.role });
          
          toast({
            title: "Account created successfully!",
            description: "Welcome to Progress Tracker!",
          });
        } else {
          // User is pending approval, don't set as current user
          console.log('✅ Sign up successful but pending approval:', { role: result.user.role, status: result.user.status });
          
          toast({
            title: "Account created successfully!",
            description: `Your ${result.user.role.toLowerCase()} account is pending approval. You'll be notified once approved.`,
          });
        }
        
        return { success: true };
      } else {
        console.error('❌ Sign up failed:', result.error);
        toast({
          title: "Sign up failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in user...', { email });
      setLoading(true);

      const result = await AuthService.signin(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        setUserRole(result.user.role);
        console.log('✅ Sign in successful:', { role: result.user.role });
        
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        
        return { success: true };
      } else {
        console.error('❌ Sign in failed:', result.error);
        toast({
          title: "Sign in failed",
          description: result.error || "Failed to sign in",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 Signing out user...');
      setLoading(true);

      const result = await AuthService.signout();
      
      if (result.success) {
        setUser(null);
        setUserRole(null);
        console.log('✅ Sign out successful');
        
        toast({
          title: "Signed out",
          description: "You've been signed out successfully.",
        });
      } else {
        console.error('❌ Sign out failed:', result.error);
        toast({
          title: "Sign out failed",
          description: result.error || "Failed to sign out",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const currentUser = await AuthService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setUserRole(currentUser.role);
        console.log('✅ User data refreshed:', { role: currentUser.role });
      } else {
        setUser(null);
        setUserRole(null);
        console.log('ℹ️ No user found after refresh');
      }
    } catch (error) {
      console.error('❌ Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
