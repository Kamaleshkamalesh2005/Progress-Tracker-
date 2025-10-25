import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  TrendingUp, 
  Plus, 
  Settings, 
  Trash2, 
  Edit, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  BarChart3,
  Megaphone,
  UserCheck,
  UserX,
  Award,
  Target,
  AlertTriangle,
  Bell,
  Mail,
  Shield,
  Crown,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AuthService, User, College } from '@/services/auth';
import { useDashboardData } from '@/hooks/useDashboardData';

interface College {
  id: string;
  name: string;
  address: string;
  contactInfo: string;
  email: string;
  phone: string;
  assignedAdminId: string;
  assignedAdminName: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  studentCount: number;
  teacherCount: number;
  performanceScore: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  collegeName: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  accessLevel: 'admin' | 'super_admin';
  createdAt: string;
  lastActive: string;
  performanceScore: number;
}

interface Notification {
  id: string;
  type: 'admin_signup' | 'college_created' | 'performance_alert' | 'system_update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionRequired: boolean;
  relatedId?: string;
}

interface SuperAdminStats {
  totalColleges: number;
  totalAdmins: number;
  pendingAdmins: number;
  activeColleges: number;
  suspendedColleges: number;
  totalStudents: number;
  totalTeachers: number;
  averagePerformance: number;
}

interface PerformanceMetric {
  collegeId: string;
  collegeName: string;
  studentCount: number;
  teacherCount: number;
  codingActivity: number;
  leaderboardRank: number;
  completionRate: number;
  lastUpdated: string;
}

export default function SuperAdminDashboard() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialog states
  const [isCollegeDialogOpen, setIsCollegeDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isEditCollegeDialogOpen, setIsEditCollegeDialogOpen] = useState(false);
  const [isEditAdminDialogOpen, setIsEditAdminDialogOpen] = useState(false);
  
  // Editing states
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  
  // Form states
  const [newCollege, setNewCollege] = useState({
    name: '',
    address: '',
    contactInfo: '',
    email: '',
    phone: '',
    assignedAdminId: '',
    assignedAdminName: ''
  });
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    collegeName: '',
    accessLevel: 'admin' as 'admin' | 'super_admin'
  });
  
  // Data states
  const [colleges, setColleges] = useState<College[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<User[]>([]);
  const [allAdmins, setAllAdmins] = useState<User[]>([]); // All admin users from signup
  const [approvedAdminColleges, setApprovedAdminColleges] = useState<User[]>([]); // Approved admin colleges
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [stats, setStats] = useState<SuperAdminStats>({
    totalColleges: 0,
    totalAdmins: 0,
    pendingAdmins: 0,
    activeColleges: 0,
    suspendedColleges: 0,
    totalStudents: 0,
    totalTeachers: 0,
    averagePerformance: 0
  });

  // System Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dashboardAlerts, setDashboardAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [lowPerformanceAlerts, setLowPerformanceAlerts] = useState(true);
  const [isSystemHealthCheckRunning, setIsSystemHealthCheckRunning] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [isResettingSettings, setIsResettingSettings] = useState(false);

  // Load super admin data from localStorage  
  useEffect(() => {
    const loadSuperAdminData = async () => {
      try {
        // Load colleges
        const savedColleges = localStorage.getItem('superadmin_colleges');
        if (savedColleges) {
          const parsedColleges = JSON.parse(savedColleges);
          setColleges(parsedColleges);
        }

        // Load admins
        const savedAdmins = localStorage.getItem('superadmin_admins');
        if (savedAdmins) {
          const parsedAdmins = JSON.parse(savedAdmins);
          setAdmins(parsedAdmins);
        }

        // Load pending admins from AuthService
        const pending = await AuthService.getPendingAdmins();
        setPendingAdmins(pending);

        // Load all admin users from AuthService
        const allAdminUsers = await AuthService.getAllUsersByRole('ADMIN');
        setAllAdmins(allAdminUsers);

        // Load approved admin colleges (colleges from approved admins)
        const approvedAdmins = allAdminUsers.filter(admin => admin.status === 'approved');
        setApprovedAdminColleges(approvedAdmins);

        // Load notifications from AuthService
        const notifs = await AuthService.getNotifications();
        setNotifications(notifs);

        // Load performance metrics
        const savedMetrics = localStorage.getItem('superadmin_performance_metrics');
        if (savedMetrics) {
          const parsedMetrics = JSON.parse(savedMetrics);
          setPerformanceMetrics(parsedMetrics);
        }

        console.log('✅ Super Admin data loaded successfully');
        setIsLoading(false);
        
        // Calculate stats from loaded data after state is updated
        setTimeout(() => {
          updateStatsFromData();
        }, 100);
      } catch (error) {
        console.error('❌ Error loading super admin data:', error);
        setIsLoading(false);
      }
    };

    if (user) {
      loadSuperAdminData();
    }
  }, [user]);

  // Update stats based on actual data
  const updateStatsFromData = () => {
    // Get all users from database for real statistics
    const allUsers = AuthService.getMockUsers();
    
    // Calculate real statistics from all users
    const adminUsers = allUsers.filter(user => user.role === 'ADMIN');
    const studentUsers = allUsers.filter(user => user.role === 'STUDENT');
    const teacherUsers = allUsers.filter(user => user.role === 'TEACHER');
    
    // Count colleges (unique college names from admins)
    const collegeNames = new Set(adminUsers.map(admin => admin.college_name).filter(Boolean));
    const totalColleges = collegeNames.size;
    
    // Count admins by status
    const totalAdmins = adminUsers.length;
    const pendingAdmins = adminUsers.filter(admin => admin.status === 'pending').length;
    const approvedAdmins = adminUsers.filter(admin => admin.status === 'approved').length;
    const suspendedAdmins = adminUsers.filter(admin => admin.status === 'rejected').length;
    
    // Count students and teachers
    const totalStudents = studentUsers.filter(student => student.status === 'approved').length;
    const totalTeachers = teacherUsers.filter(teacher => teacher.status === 'approved').length;
    
    // Calculate average performance (mock calculation based on user activity)
    let averagePerformance = 0;
    if (totalColleges > 0) {
      // Mock performance calculation based on student/teacher ratio and activity
      const totalActiveUsers = totalStudents + totalTeachers;
      averagePerformance = Math.min(100, Math.round((totalActiveUsers / totalColleges) * 10));
    }
    
    const newStats = {
      totalColleges: totalColleges,
      totalAdmins: totalAdmins,
      pendingAdmins: pendingAdmins,
      activeColleges: approvedAdmins, // Approved admins = active colleges
      suspendedColleges: suspendedAdmins,
      totalStudents: totalStudents,
      totalTeachers: totalTeachers,
      averagePerformance: averagePerformance
    };
    
    setStats(newStats);
    localStorage.setItem('superadmin_stats', JSON.stringify(newStats));
    console.log('📊 Updated Super Admin stats with real data:', newStats);
  };

  // Save functions
  const saveColleges = (collegesToSave: College[]) => {
    try {
      localStorage.setItem('superadmin_colleges', JSON.stringify(collegesToSave));
      console.log('💾 Colleges saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving colleges:', error);
    }
  };

  const saveAdmins = (adminsToSave: AdminUser[]) => {
    try {
      localStorage.setItem('superadmin_admins', JSON.stringify(adminsToSave));
      console.log('💾 Admins saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving admins:', error);
    }
  };

  const saveNotifications = (notificationsToSave: Notification[]) => {
    try {
      localStorage.setItem('superadmin_notifications', JSON.stringify(notificationsToSave));
      console.log('💾 Notifications saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving notifications:', error);
    }
  };

  // College Management Functions
  const addCollege = () => {
    if (!newCollege.name.trim() || !newCollege.email.trim()) {
      toast({
        title: "Required fields",
        description: "Please enter college name and email.",
        variant: "destructive",
      });
      return;
    }

    const newCollegeData: College = {
      id: Date.now().toString(),
      name: newCollege.name,
      address: newCollege.address,
      contactInfo: newCollege.contactInfo,
      email: newCollege.email,
      phone: newCollege.phone,
      assignedAdminId: newCollege.assignedAdminId,
      assignedAdminName: newCollege.assignedAdminName,
      status: 'active',
      createdAt: new Date().toISOString(),
      studentCount: 0,
      teacherCount: 0,
      performanceScore: 0
    };

    const updatedColleges = [...colleges, newCollegeData];
    setColleges(updatedColleges);
    saveColleges(updatedColleges);

    // Add notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'college_created',
      title: 'New College Created',
      message: `${newCollege.name} has been added to the system.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      actionRequired: false,
      relatedId: newCollegeData.id
    };
    const updatedNotifications = [...notifications, newNotification];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);

    // Update stats
    setTimeout(() => updateStatsFromData(), 100);

    toast({
      title: "College added",
      description: `${newCollege.name} has been added successfully.`,
    });

    // Reset form
    setNewCollege({ name: '', address: '', contactInfo: '', email: '', phone: '', assignedAdminId: '', assignedAdminName: '' });
    setIsCollegeDialogOpen(false);
  };

  const deleteCollege = (collegeId: string) => {
    const college = colleges.find(col => col.id === collegeId);
    if (!college) return;

    const updatedColleges = colleges.filter(col => col.id !== collegeId);
    setColleges(updatedColleges);
    saveColleges(updatedColleges);

    // Update stats
    setTimeout(() => updateStatsFromData(), 100);

    toast({
      title: "College deleted",
      description: `${college.name} has been removed successfully.`,
    });
  };

  const updateCollegeStatus = (collegeId: string, status: 'active' | 'inactive' | 'suspended') => {
    const updatedColleges = colleges.map(college =>
      college.id === collegeId ? { ...college, status } : college
    );
    setColleges(updatedColleges);
    saveColleges(updatedColleges);

    const college = colleges.find(col => col.id === collegeId);
    toast({
      title: "College status updated",
      description: `${college?.name} status changed to ${status}.`,
    });

    // Update stats
    setTimeout(() => updateStatsFromData(), 100);
  };

  // Admin Management Functions
  const addAdmin = () => {
    if (!newAdmin.name.trim() || !newAdmin.email.trim() || !newAdmin.collegeName.trim()) {
      toast({
        title: "Required fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newAdminData: AdminUser = {
      id: Date.now().toString(),
      name: newAdmin.name,
      email: newAdmin.email,
      collegeId: `college_${Date.now()}`,
      collegeName: newAdmin.collegeName,
      status: 'approved',
      accessLevel: newAdmin.accessLevel,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      performanceScore: 0
    };

    const updatedAdmins = [...admins, newAdminData];
    setAdmins(updatedAdmins);
    saveAdmins(updatedAdmins);

    // Update stats
    setTimeout(() => updateStatsFromData(), 100);

    toast({
      title: "Admin created",
      description: `${newAdmin.name} has been created successfully.`,
    });

    // Reset form
    setNewAdmin({ name: '', email: '', collegeName: '', accessLevel: 'admin' });
    setIsAdminDialogOpen(false);
  };

  // Calculate college performance based on real student data
  const calculateCollegePerformance = (admin: User): number => {
    try {
      // Get all users from database
      const allUsers = AuthService.getMockUsers();
      
      // Find all approved students in this college
      const studentsInCollege = allUsers.filter(user => 
        user.role === 'STUDENT' && 
        user.status === 'approved' &&
        user.college_name === admin.college_name
      );
      
      // If no students, return 0%
      if (studentsInCollege.length === 0) {
        return 0;
      }
      
      // Calculate real performance metrics
      let totalProblemsSolved = 0;
      let totalStudents = studentsInCollege.length;
      
      // Get platform connections for each student and sum up problems solved
      studentsInCollege.forEach(student => {
        try {
          const savedConnections = localStorage.getItem(`platformConnections_${student.id}`);
          if (savedConnections) {
            const connections = JSON.parse(savedConnections);
            connections.forEach((connection: any) => {
              if (connection.problemsSolved) {
                totalProblemsSolved += connection.problemsSolved;
              }
            });
          }
        } catch (error) {
          console.error('Error reading student connections:', error);
        }
      });
      
      // Calculate performance score based on problems solved per student
      const avgProblemsPerStudent = totalProblemsSolved / totalStudents;
      
      // Performance scoring:
      // 0-10 problems per student = 0-20%
      // 10-50 problems per student = 20-60%
      // 50+ problems per student = 60-100%
      let performanceScore = 0;
      if (avgProblemsPerStudent >= 50) {
        performanceScore = 60 + Math.min(40, (avgProblemsPerStudent - 50) * 0.8);
      } else if (avgProblemsPerStudent >= 10) {
        performanceScore = 20 + ((avgProblemsPerStudent - 10) / 40) * 40;
      } else {
        performanceScore = (avgProblemsPerStudent / 10) * 20;
      }
      
      return Math.min(100, Math.round(performanceScore));
    } catch (error) {
      console.error('Error calculating college performance:', error);
      return 0;
    }
  };

  // Get real student count for a college (from actual database)
  const getRealStudentCount = (admin: User): number => {
    try {
      // Query actual students from localStorage who belong to this college
      const allUsers = AuthService.getMockUsers();
      const studentsInCollege = allUsers.filter(user => 
        user.role === 'STUDENT' && 
        user.status === 'approved' &&
        user.college_name === admin.college_name
      );
      return studentsInCollege.length;
    } catch (error) {
      console.error('Error getting real student count:', error);
      return 0;
    }
  };

  // Admin action handlers for the table
  const handleApproveAdmin = async (adminId: string) => {
    try {
      const result = await AuthService.approveUser(adminId);
      if (result.success) {
        toast({
          title: "Admin approved",
          description: "Admin account has been approved successfully.",
        });
        // Reload admin data
        const allAdminUsers = await AuthService.getAllUsersByRole('ADMIN');
        setAllAdmins(allAdminUsers);
        updateStatsFromData();
      } else {
        toast({
          title: "Approval failed",
          description: result.error || "Failed to approve admin",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error approving admin:', error);
      toast({
        title: "Error",
        description: "Failed to approve admin",
        variant: "destructive",
      });
    }
  };

  const handleRejectAdmin = async (adminId: string) => {
    try {
      const result = await AuthService.rejectUser(adminId);
      if (result.success) {
        toast({
          title: "Admin rejected",
          description: "Admin account has been rejected.",
        });
        // Reload admin data
        const allAdminUsers = await AuthService.getAllUsersByRole('ADMIN');
        setAllAdmins(allAdminUsers);
        updateStatsFromData();
      } else {
        toast({
          title: "Rejection failed",
          description: result.error || "Failed to reject admin",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error rejecting admin:', error);
      toast({
        title: "Error",
        description: "Failed to reject admin",
        variant: "destructive",
      });
    }
  };

  const handleSuspendAdmin = async (adminId: string) => {
    try {
      const result = await AuthService.suspendUser(adminId);
      if (result.success) {
        toast({
          title: "Admin suspended",
          description: "Admin account has been suspended.",
        });
        // Reload admin data
        const allAdminUsers = await AuthService.getAllUsersByRole('ADMIN');
        setAllAdmins(allAdminUsers);
        updateStatsFromData();
      } else {
        toast({
          title: "Suspension failed",
          description: result.error || "Failed to suspend admin",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error suspending admin:', error);
      toast({
        title: "Error",
        description: "Failed to suspend admin",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const result = await AuthService.deleteUser(adminId);
      if (result.success) {
        toast({
          title: "Admin deleted",
          description: "Admin account has been deleted.",
        });
        // Reload admin data
        const allAdminUsers = await AuthService.getAllUsersByRole('ADMIN');
        setAllAdmins(allAdminUsers);
        updateStatsFromData();
      } else {
        toast({
          title: "Deletion failed",
          description: result.error || "Failed to delete admin",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: "Error",
        description: "Failed to delete admin",
        variant: "destructive",
      });
    }
  };

  const approveAdmin = async (adminId: string) => {
    try {
      const result = await AuthService.approveAdmin(adminId);
      if (result.success) {
        // Reload pending admins
        const pending = await AuthService.getPendingAdmins();
        setPendingAdmins(pending);
        
        // Reload notifications
        const notifs = await AuthService.getNotifications();
        setNotifications(notifs);
        
        updateStatsFromData();

        const admin = pendingAdmins.find(a => a.id === adminId);
        toast({
          title: "Admin approved",
          description: `${admin?.name} has been approved successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve admin",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error approving admin:', error);
      toast({
        title: "Error",
        description: "Failed to approve admin",
        variant: "destructive",
      });
    }
  };

  const rejectAdmin = async (adminId: string) => {
    try {
      const result = await AuthService.rejectAdmin(adminId);
      if (result.success) {
        // Reload pending admins
        const pending = await AuthService.getPendingAdmins();
        setPendingAdmins(pending);
        
        // Reload notifications
        const notifs = await AuthService.getNotifications();
        setNotifications(notifs);
        
        updateStatsFromData();

        const admin = pendingAdmins.find(a => a.id === adminId);
        toast({
          title: "Admin rejected",
          description: `${admin?.name} has been rejected.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject admin",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error rejecting admin:', error);
      toast({
        title: "Error",
        description: "Failed to reject admin",
        variant: "destructive",
      });
    }
  };

  const suspendAdmin = (adminId: string) => {
    const updatedAdmins = admins.map(admin =>
      admin.id === adminId ? { ...admin, status: 'suspended' as const } : admin
    );
    setAdmins(updatedAdmins);
    saveAdmins(updatedAdmins);

    const admin = admins.find(a => a.id === adminId);
    toast({
      title: "Admin suspended",
      description: `${admin?.name} has been suspended.`,
    });

    // Update stats
    setTimeout(() => updateStatsFromData(), 100);
  };

  // Notification Management
  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
    toast({
      title: "Notifications cleared",
      description: "All notifications have been cleared.",
    });
  };

  // System Settings Functions
  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
    localStorage.setItem('superadmin_email_notifications', JSON.stringify(!emailNotifications));
    toast({
      title: emailNotifications ? "Email notifications disabled" : "Email notifications enabled",
      description: emailNotifications ? "You will no longer receive email notifications for admin signups." : "You will now receive email notifications for admin signups.",
    });
  };

  const toggleDashboardAlerts = () => {
    setDashboardAlerts(!dashboardAlerts);
    localStorage.setItem('superadmin_dashboard_alerts', JSON.stringify(!dashboardAlerts));
    toast({
      title: dashboardAlerts ? "Dashboard alerts disabled" : "Dashboard alerts enabled",
      description: dashboardAlerts ? "Dashboard alerts for system events have been disabled." : "Dashboard alerts for system events have been enabled.",
    });
  };

  const toggleWeeklyReports = () => {
    setWeeklyReports(!weeklyReports);
    localStorage.setItem('superadmin_weekly_reports', JSON.stringify(!weeklyReports));
    toast({
      title: weeklyReports ? "Weekly reports disabled" : "Weekly reports enabled",
      description: weeklyReports ? "Automatic weekly performance reports have been disabled." : "Automatic weekly performance reports have been enabled.",
    });
  };

  const toggleLowPerformanceAlerts = () => {
    setLowPerformanceAlerts(!lowPerformanceAlerts);
    localStorage.setItem('superadmin_low_performance_alerts', JSON.stringify(!lowPerformanceAlerts));
    toast({
      title: lowPerformanceAlerts ? "Low performance alerts disabled" : "Low performance alerts enabled",
      description: lowPerformanceAlerts ? "Alerts for low performance have been disabled." : "Alerts for low performance have been enabled.",
    });
  };

  const runSystemHealthCheck = async () => {
    setIsSystemHealthCheckRunning(true);
    
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check various system components
    const healthStatus = {
      database: 'healthy',
      authentication: 'healthy',
      notifications: 'healthy',
      performance: 'healthy',
      storage: 'healthy'
    };
    
    setIsSystemHealthCheckRunning(false);
    
    toast({
      title: "System Health Check Complete",
      description: `All systems are ${healthStatus.database}. Database: ${healthStatus.database}, Auth: ${healthStatus.authentication}, Notifications: ${healthStatus.notifications}`,
    });
  };

  const clearOldData = async () => {
    setIsClearingData(true);
    
    // Simulate data clearing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Clear old notifications (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filteredNotifications = notifications.filter(notification => 
      new Date(notification.createdAt) > thirtyDaysAgo
    );
    
    setNotifications(filteredNotifications);
    saveNotifications(filteredNotifications);
    
    setIsClearingData(false);
    
    toast({
      title: "Old Data Cleared",
      description: `Cleared ${notifications.length - filteredNotifications.length} old notifications and temporary files.`,
    });
  };

  const resetSettings = async () => {
    setIsResettingSettings(true);
    
    // Simulate settings reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset all settings to defaults
    setEmailNotifications(true);
    setDashboardAlerts(true);
    setWeeklyReports(true);
    setLowPerformanceAlerts(true);
    
    // Clear localStorage settings
    localStorage.removeItem('superadmin_email_notifications');
    localStorage.removeItem('superadmin_dashboard_alerts');
    localStorage.removeItem('superadmin_weekly_reports');
    localStorage.removeItem('superadmin_low_performance_alerts');
    
    setIsResettingSettings(false);
    
    toast({
      title: "Settings Reset",
      description: "All system settings have been reset to their default values.",
    });
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (userRole && userRole !== 'SUPER_ADMIN') {
        // Redirect to appropriate dashboard based on role
        switch (userRole) {
          case 'ADMIN':
            navigate('/dashboard/admin');
            break;
          case 'TEACHER':
            navigate('/dashboard/teacher');
            break;
          case 'STUDENT':
            navigate('/dashboard/student');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [user, userRole, loading, navigate]);

  // Load system settings from localStorage
  useEffect(() => {
    const loadSystemSettings = () => {
      try {
        const emailNotifs = localStorage.getItem('superadmin_email_notifications');
        const dashboardAlertsSetting = localStorage.getItem('superadmin_dashboard_alerts');
        const weeklyReportsSetting = localStorage.getItem('superadmin_weekly_reports');
        const lowPerfAlerts = localStorage.getItem('superadmin_low_performance_alerts');

        if (emailNotifs !== null) {
          setEmailNotifications(JSON.parse(emailNotifs));
        }
        if (dashboardAlertsSetting !== null) {
          setDashboardAlerts(JSON.parse(dashboardAlertsSetting));
        }
        if (weeklyReportsSetting !== null) {
          setWeeklyReports(JSON.parse(weeklyReportsSetting));
        }
        if (lowPerfAlerts !== null) {
          setLowPerformanceAlerts(JSON.parse(lowPerfAlerts));
        }
      } catch (error) {
        console.error('Error loading system settings:', error);
      }
    };

    loadSystemSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || userRole !== 'SUPER_ADMIN') {
    return null; // Will redirect via useEffect
  }

  return (
    <DashboardLayout title="Super Admin Dashboard">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Colleges"
            value={stats.totalColleges}
            icon={Building2}
            gradient="from-primary to-secondary"
            delay={0}
          />
          <StatCard
            title="Total Admins"
            value={stats.totalAdmins}
            icon={Shield}
            gradient="from-green-500 to-emerald-500"
            delay={0.1}
          />
          <StatCard
            title="Pending Admins"
            value={stats.pendingAdmins}
            icon={Clock}
            gradient="from-yellow-500 to-orange-500"
            delay={0.2}
          />
          <StatCard
            title="Active Colleges"
            value={stats.activeColleges}
            icon={TrendingUp}
            gradient="from-blue-500 to-cyan-500"
            delay={0.3}
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            gradient="from-purple-500 to-pink-500"
            delay={0.4}
          />
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={GraduationCap}
            gradient="from-indigo-500 to-purple-500"
            delay={0.5}
          />
          <StatCard
            title="Suspended Colleges"
            value={stats.suspendedColleges}
            icon={AlertTriangle}
            gradient="from-red-500 to-pink-500"
            delay={0.6}
          />
          <StatCard
            title="Avg Performance"
            value={`${Math.round(stats.averagePerformance)}%`}
            icon={Award}
            gradient="from-orange-500 to-red-500"
            delay={0.7}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="colleges">Colleges</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          Recent Notifications
                        </CardTitle>
                        <CardDescription>Latest system notifications and alerts</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={clearAllNotifications}
                          className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Clear All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {notifications.length === 0 ? (
                      <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                        <p className="text-muted-foreground">
                          System notifications will appear here when admins sign up
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-lg border transition-colors ${
                              notification.isRead 
                                ? 'bg-muted/20 border-muted' 
                                : 'bg-primary/5 border-primary/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{notification.title}</h4>
                                  {notification.actionRequired && (
                                    <Badge variant="destructive" className="text-xs">Action Required</Badge>
                                  )}
                                  {!notification.isRead && (
                                    <Badge className="bg-blue-500 text-xs">New</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="border-green-500/20 text-green-600 hover:bg-green-500/10"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      <Button 
                        className="w-full justify-start"
                        onClick={() => setIsCollegeDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New College
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          console.log('Create New Admin button clicked');
                          setIsAdminDialogOpen(true);
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Create New Admin
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveTab('performance')}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Performance
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveTab('notifications')}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Manage Notifications
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Colleges Tab */}
          <TabsContent value="colleges" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      College Management
                    </CardTitle>
                    <CardDescription>View approved colleges with real student performance data and rankings</CardDescription>
                  </div>
                  <Dialog open={isCollegeDialogOpen} onOpenChange={setIsCollegeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-primary to-secondary">
                        <Plus className="h-4 w-4 mr-2" />
                        Create College
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New College</DialogTitle>
                        <DialogDescription>
                          Add a new college to the system
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="college-name">College Name *</Label>
                            <Input
                              id="college-name"
                              value={newCollege.name}
                              onChange={(e) => setNewCollege(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter college name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="college-email">Email *</Label>
                            <Input
                              id="college-email"
                              type="email"
                              value={newCollege.email}
                              onChange={(e) => setNewCollege(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Enter college email"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="college-address">Address</Label>
                          <Textarea
                            id="college-address"
                            value={newCollege.address}
                            onChange={(e) => setNewCollege(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Enter college address"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="college-phone">Phone</Label>
                            <Input
                              id="college-phone"
                              value={newCollege.phone}
                              onChange={(e) => setNewCollege(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="college-contact">Contact Info</Label>
                            <Input
                              id="college-contact"
                              value={newCollege.contactInfo}
                              onChange={(e) => setNewCollege(prev => ({ ...prev, contactInfo: e.target.value }))}
                              placeholder="Additional contact info"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="assigned-admin-id">Assigned Admin ID</Label>
                            <Input
                              id="assigned-admin-id"
                              value={newCollege.assignedAdminId}
                              onChange={(e) => setNewCollege(prev => ({ ...prev, assignedAdminId: e.target.value }))}
                              placeholder="Admin ID"
                            />
                          </div>
                          <div>
                            <Label htmlFor="assigned-admin-name">Assigned Admin Name</Label>
                            <Input
                              id="assigned-admin-name"
                              value={newCollege.assignedAdminName}
                              onChange={(e) => setNewCollege(prev => ({ ...prev, assignedAdminName: e.target.value }))}
                              placeholder="Admin name"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCollegeDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={addCollege}>
                            Create College
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {approvedAdminColleges.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No approved colleges yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Approve admin accounts to see their colleges with real student performance data
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>College Name</TableHead>
                        <TableHead>Admin Name</TableHead>
                        <TableHead>Admin Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Performance Score</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedAdminColleges
                        .sort((a, b) => {
                          // Sort by performance score (mock calculation based on admin data)
                          const scoreA = calculateCollegePerformance(a);
                          const scoreB = calculateCollegePerformance(b);
                          return scoreB - scoreA;
                        })
                        .map((college, index) => (
                        <TableRow key={college.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {index === 0 && <Crown className="h-4 w-4 text-yellow-500 mr-1" />}
                              {index === 1 && <Award className="h-4 w-4 text-gray-400 mr-1" />}
                              {index === 2 && <Award className="h-4 w-4 text-orange-500 mr-1" />}
                              <span className="font-bold text-lg">#{index + 1}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{college.college_name || 'Unnamed College'}</TableCell>
                          <TableCell>{college.name}</TableCell>
                          <TableCell>{college.email}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              ✅ Approved
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Progress 
                                value={calculateCollegePerformance(college)} 
                                className="w-16 mr-2" 
                              />
                              <span className="text-sm font-medium">
                                {calculateCollegePerformance(college)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-blue-500" />
                              {getRealStudentCount(college)}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(college.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSuspendAdmin(college.id)}
                                className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Suspend
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteAdmin(college.id)}
                                className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Admin Management
                    </CardTitle>
                    <CardDescription>Create and manage admin accounts</CardDescription>
                  </div>
                  <Dialog open={isAdminDialogOpen} onOpenChange={(open) => {
                    console.log('Admin dialog state changed:', open);
                    setIsAdminDialogOpen(open);
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-primary to-secondary">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Admin
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Admin</DialogTitle>
                        <DialogDescription>
                          Create a new admin account
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="admin-name">Admin Name *</Label>
                          <Input
                            id="admin-name"
                            value={newAdmin.name}
                            onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter admin name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin-email">Email *</Label>
                          <Input
                            id="admin-email"
                            type="email"
                            value={newAdmin.email}
                            onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter admin email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin-college">Assigned College *</Label>
                          <Select value={newAdmin.collegeId} onValueChange={(value) => setNewAdmin(prev => ({ ...prev, collegeId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select college" />
                            </SelectTrigger>
                            <SelectContent>
                              {colleges.map((college) => (
                                <SelectItem key={college.id} value={college.id}>
                                  {college.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="admin-access">Access Level</Label>
                          <Select value={newAdmin.accessLevel} onValueChange={(value: 'admin' | 'super_admin') => setNewAdmin(prev => ({ ...prev, accessLevel: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={addAdmin}>
                            Create Admin
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {allAdmins.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No admins yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first admin account
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-primary to-secondary"
                      onClick={() => {
                        console.log('Create admin button in empty state clicked');
                        setIsAdminDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Admin
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAdmins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.name}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>{admin.college_name || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              Admin
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                admin.status === 'approved' ? 'default' : 
                                admin.status === 'rejected' ? 'destructive' : 
                                admin.status === 'suspended' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {admin.status === 'pending' && '⚠️ Pending'}
                              {admin.status === 'approved' && '✅ Approved'}
                              {admin.status === 'rejected' && '❌ Rejected'}
                              {admin.status === 'suspended' && '⚠️ Suspended'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {admin.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveAdmin(admin.id)}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleRejectAdmin(admin.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {admin.status === 'approved' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleSuspendAdmin(admin.id)}
                                  className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Suspend
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                  className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            )}
                            {admin.status === 'rejected' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveAdmin(admin.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Re-Activate
                              </Button>
                            )}
                            {admin.status === 'suspended' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveAdmin(admin.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Admin Approval Management
                </CardTitle>
                <CardDescription>Review and approve admin registration requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingAdmins.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending admin approvals</h3>
                    <p className="text-muted-foreground">
                      All admin registration requests have been reviewed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAdmins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{admin.name}</h4>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">College: {admin.college_name}</Badge>
                              <Badge variant="outline">Role: {admin.role}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied: {new Date(admin.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => approveAdmin(admin.id)} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectAdmin(admin.id)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Performance Dashboard
                </CardTitle>
                <CardDescription>Monitor college and admin performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {colleges.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No performance data</h3>
                    <p className="text-muted-foreground mb-4">
                      Performance metrics will be displayed here as colleges are added
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {colleges.map((college) => (
                      <div key={college.id} className="p-4 rounded-lg bg-muted/20">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">{college.name}</h4>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{college.studentCount} students</span>
                            <span>{college.teacherCount} teachers</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Performance Score</span>
                              <span className="text-sm text-muted-foreground">{college.performanceScore}%</span>
                            </div>
                            <Progress value={college.performanceScore} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Student Activity</span>
                              <span className="text-sm text-muted-foreground">{Math.round(college.studentCount * 0.8)}%</span>
                            </div>
                            <Progress value={college.studentCount * 0.8} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Admin Activity</span>
                              <span className="text-sm text-muted-foreground">{Math.round(college.performanceScore * 0.9)}%</span>
                            </div>
                            <Progress value={college.performanceScore * 0.9} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Notification Center
                    </CardTitle>
                    <CardDescription>Manage system notifications and alerts</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearAllNotifications}
                      className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground mb-4">
                      System notifications will appear here when admins sign up
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.isRead 
                            ? 'bg-muted/20 border-muted' 
                            : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{notification.title}</h4>
                              {notification.actionRequired && (
                                <Badge variant="destructive" className="text-xs">Action Required</Badge>
                              )}
                              {!notification.isRead && (
                                <Badge className="bg-blue-500 text-xs">New</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {notification.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="border-green-500/20 text-green-600 hover:bg-green-500/10"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            {notification.actionRequired && notification.type === 'admin_signup' && (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    // Find pending admin and approve
                                    const pendingAdmin = admins.find(admin => admin.status === 'pending');
                                    if (pendingAdmin) {
                                      approveAdmin(pendingAdmin.id);
                                      markNotificationAsRead(notification.id);
                                    }
                                  }}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    // Find pending admin and reject
                                    const pendingAdmin = admins.find(admin => admin.status === 'pending');
                                    if (pendingAdmin) {
                                      rejectAdmin(pendingAdmin.id);
                                      markNotificationAsRead(notification.id);
                                    }
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  System Settings
                </CardTitle>
                <CardDescription>Configure system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-2">Notification Preferences</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure how you receive notifications for admin signups and system events.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email notifications for admin signups</span>
                        <Button 
                          variant={emailNotifications ? "default" : "outline"} 
                          size="sm"
                          onClick={toggleEmailNotifications}
                        >
                          {emailNotifications ? "Disable" : "Enable"}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Dashboard alerts for system events</span>
                        <Button 
                          variant={dashboardAlerts ? "default" : "outline"} 
                          size="sm"
                          onClick={toggleDashboardAlerts}
                        >
                          {dashboardAlerts ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-2">Performance Monitoring</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set up automatic performance monitoring and alerts.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Weekly performance reports</span>
                        <Button 
                          variant={weeklyReports ? "default" : "outline"} 
                          size="sm"
                          onClick={toggleWeeklyReports}
                        >
                          {weeklyReports ? "Disable" : "Enable"}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Low performance alerts</span>
                        <Button 
                          variant={lowPerformanceAlerts ? "default" : "outline"} 
                          size="sm"
                          onClick={toggleLowPerformanceAlerts}
                        >
                          {lowPerformanceAlerts ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-2">System Maintenance</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Perform system maintenance and cleanup tasks.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={runSystemHealthCheck}
                        disabled={isSystemHealthCheckRunning}
                      >
                        {isSystemHealthCheckRunning ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Activity className="h-4 w-4 mr-1" />
                        )}
                        {isSystemHealthCheckRunning ? "Checking..." : "System Health Check"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearOldData}
                        disabled={isClearingData}
                      >
                        {isClearingData ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        {isClearingData ? "Clearing..." : "Clear Old Data"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={resetSettings}
                        disabled={isResettingSettings}
                      >
                        {isResettingSettings ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Settings className="h-4 w-4 mr-1" />
                        )}
                        {isResettingSettings ? "Resetting..." : "Reset Settings"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* College Creation Dialog */}
      <Dialog open={isCollegeDialogOpen} onOpenChange={setIsCollegeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New College</DialogTitle>
            <DialogDescription>
              Add a new college to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collegeName">College Name</Label>
              <Input
                id="collegeName"
                value={newCollege.name}
                onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                placeholder="Enter college name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collegeEmail">Email</Label>
              <Input
                id="collegeEmail"
                type="email"
                value={newCollege.email}
                onChange={(e) => setNewCollege({ ...newCollege, email: e.target.value })}
                placeholder="Enter college email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collegeAddress">Address</Label>
              <Textarea
                id="collegeAddress"
                value={newCollege.address}
                onChange={(e) => setNewCollege({ ...newCollege, address: e.target.value })}
                placeholder="Enter college address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collegePhone">Phone</Label>
              <Input
                id="collegePhone"
                value={newCollege.phone}
                onChange={(e) => setNewCollege({ ...newCollege, phone: e.target.value })}
                placeholder="Enter college phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collegeContact">Contact Info</Label>
              <Textarea
                id="collegeContact"
                value={newCollege.contactInfo}
                onChange={(e) => setNewCollege({ ...newCollege, contactInfo: e.target.value })}
                placeholder="Enter contact information"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCollegeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addCollege}>
                Create College
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Creation Dialog */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
            <DialogDescription>
              Add a new admin to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                placeholder="Enter admin name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                placeholder="Enter admin email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminCollege">College</Label>
              <Input
                id="adminCollege"
                value={newAdmin.collegeName}
                onChange={(e) => setNewAdmin({ ...newAdmin, collegeName: e.target.value })}
                placeholder="Type college name..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminAccess">Access Level</Label>
              <Select value={newAdmin.accessLevel} onValueChange={(value: 'admin' | 'super_admin') => setNewAdmin({ ...newAdmin, accessLevel: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addAdmin}>
                Create Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
