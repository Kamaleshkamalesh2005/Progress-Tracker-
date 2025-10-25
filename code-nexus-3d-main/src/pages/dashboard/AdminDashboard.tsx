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
  Save,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Mail,
  User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AuthService, User } from '@/services/auth';
import { useSupabaseTeachers, Department, Teacher } from '@/hooks/useSupabaseTeachers';

interface Institution {
  id: string;
  name: string;
  description: string;
  students: number;
  teachers: number;
  createdAt: string;
}

// Department interface is now imported from useRealTimeTeachers hook

interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  qualifications: string;
  experience: string;
}

interface PerformanceMetric {
  id: string;
  departmentId: string;
  departmentName: string;
  studentsCount: number;
  averageScore: number;
  completionRate: number;
  platformUsage: number;
  lastUpdated: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'teachers' | 'students';
  createdAt: string;
  isActive: boolean;
}

interface TeacherEditForm {
  name: string;
  email: string;
  department_name: string;
  university: string;
  approved: boolean;
}

interface AdminStats {
  totalTeachers: number;
  totalStudents: number;
  activeInstitutions: number;
  pendingTeachers: number;
  totalDepartments: number;
  activeAnnouncements: number;
}

interface PlatformUsage {
  platform: string;
  users: number;
  percentage: number;
}

export default function AdminDashboard() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use Supabase hook for real teacher data
  const { 
    teacherData, 
    isLoading: teachersLoading, 
    approveTeacher: approveTeacherSupabase, 
    rejectTeacher: rejectTeacherSupabase, 
    updateTeacher: updateTeacherSupabase 
  } = useSupabaseTeachers();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialog states
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isTeacherEditDialogOpen, setIsTeacherEditDialogOpen] = useState(false);
  
  // Editing states
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [isUpdatingTeacher, setIsUpdatingTeacher] = useState(false);
  
  // Form states
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    institutionId: '',
    headOfDepartment: ''
  });
  const [newYear, setNewYear] = useState({
    year: '',
    startDate: '',
    endDate: ''
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetAudience: 'all' as 'all' | 'teachers' | 'students'
  });
  
  const [teacherEditForm, setTeacherEditForm] = useState<TeacherEditForm>({
    name: '',
    email: '',
    department_name: '',
    university: '',
    approved: false
  });
  
  // Data states - using real-time data from hook
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [pendingTeachers, setPendingTeachers] = useState<User[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalTeachers: 0,
    totalStudents: 0,
    activeInstitutions: 0,
    pendingTeachers: 0,
    totalDepartments: 0,
    activeAnnouncements: 0
  });
  const [platformUsage, setPlatformUsage] = useState<PlatformUsage[]>([]);

  // Load admin data from localStorage
  useEffect(() => {
    if (user) {
      loadAdminData();
      setIsLoading(false);
    }
  }, [user]);

  // Update stats when teacherData changes
  useEffect(() => {
    if (teacherData) {
      updateStatsFromData();
    }
  }, [teacherData]);

  const loadAdminData = async () => {
    try {
      // Departments are now handled by the Supabase hook
      console.log('📊 Loading admin data...');

      // Load academic years
      const savedYears = localStorage.getItem('admin_academic_years');
      if (savedYears) {
        const parsedYears = JSON.parse(savedYears);
        setAcademicYears(parsedYears);
      }

      // Load pending teachers from AuthService
      const pendingTeachersData = await AuthService.getPendingUsers('TEACHER');
      setPendingTeachers(pendingTeachersData);

      // Load performance metrics
      const savedMetrics = localStorage.getItem('admin_performance_metrics');
      if (savedMetrics) {
        const parsedMetrics = JSON.parse(savedMetrics);
        setPerformanceMetrics(parsedMetrics);
      }

      // Load announcements
      const savedAnnouncements = localStorage.getItem('admin_announcements');
      if (savedAnnouncements) {
        const parsedAnnouncements = JSON.parse(savedAnnouncements);
        setAnnouncements(parsedAnnouncements);
      }

      // Load platform usage
      const savedPlatformUsage = localStorage.getItem('admin_platform_usage');
      if (savedPlatformUsage) {
        const parsedPlatformUsage = JSON.parse(savedPlatformUsage);
        setPlatformUsage(parsedPlatformUsage);
      } else {
        // Initialize with specified platform usage
        setPlatformUsage([
          { platform: 'LeetCode', users: 0, percentage: 0 },
          { platform: 'GeeksforGeeks', users: 0, percentage: 0 },
          { platform: 'HackerRank', users: 0, percentage: 0 },
          { platform: 'CodeChef', users: 0, percentage: 0 },
          { platform: 'HackerEarth', users: 0, percentage: 0 },
          { platform: 'Codeforces', users: 0, percentage: 0 },
          { platform: 'AtCoder', users: 0, percentage: 0 },
          { platform: 'TopCoder', users: 0, percentage: 0 },
          { platform: 'CSES Problem Set', users: 0, percentage: 0 },
          { platform: 'InterviewBit', users: 0, percentage: 0 }
        ]);
      }

      // Calculate real stats from loaded data (only if teacherData is available)
      if (teacherData) {
        updateStatsFromData();
      }

      console.log('✅ Admin data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading admin data:', error);
    }
  };

  // Update stats based on actual data
  const updateStatsFromData = () => {
    // Get all users from database for real statistics
    const allUsers = AuthService.getMockUsers();
    
    // Calculate real statistics
    const totalTeachers = allUsers.filter(user => user.role === 'TEACHER').length;
    const totalStudents = allUsers.filter(user => user.role === 'STUDENT').length;
    const pendingTeachers = allUsers.filter(user => user.role === 'TEACHER' && user.status === 'pending').length;
    
    const newStats = {
      totalTeachers: totalTeachers,
      totalStudents: totalStudents,
      activeInstitutions: 0, // Institutions will be managed through signup approval
      pendingTeachers: pendingTeachers,
      totalDepartments: teacherData?.departments?.length || 0, // Use teacher data from Supabase hook with safety check
      activeAnnouncements: announcements.filter(ann => ann.isActive).length
    };

    setStats(newStats);
    localStorage.setItem('admin_stats', JSON.stringify(newStats));
    console.log('📊 Updated Admin stats with real data:', newStats);
  };

  // Teacher approval functions
  const approveTeacher = async (teacherId: string) => {
    try {
      const result = await AuthService.approveUser(teacherId);
      
      if (result.success) {
        toast({
          title: "Teacher Approved",
          description: "Teacher account has been approved successfully.",
        });
        
        // Reload pending teachers
        const pendingTeachersData = await AuthService.getPendingUsers('TEACHER');
        setPendingTeachers(pendingTeachersData);
        updateStatsFromData();
      } else {
        toast({
          title: "Approval Failed",
          description: result.error || "Failed to approve teacher",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error approving teacher:', error);
      toast({
        title: "Approval Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const rejectTeacher = async (teacherId: string) => {
    try {
      const result = await AuthService.rejectUser(teacherId);
      
      if (result.success) {
        toast({
          title: "Teacher Rejected",
          description: "Teacher account has been rejected.",
        });
        
        // Reload pending teachers
        const pendingTeachersData = await AuthService.getPendingUsers('TEACHER');
        setPendingTeachers(pendingTeachersData);
        updateStatsFromData();
      } else {
        toast({
          title: "Rejection Failed",
          description: result.error || "Failed to reject teacher",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error rejecting teacher:', error);
      toast({
        title: "Rejection Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Save functions
  const addDepartment = () => {
    if (!newDepartment.name.trim() || !newDepartment.institutionId) {
      toast({
        title: "Required fields",
        description: "Please enter department name and select institution.",
        variant: "destructive",
      });
      return;
    }

    const newDept: Department = {
      id: Date.now().toString(),
      name: newDepartment.name,
      description: newDepartment.description,
      institutionId: newDepartment.institutionId,
      headOfDepartment: newDepartment.headOfDepartment,
      students: 0,
      teachers: 0,
      createdAt: new Date().toISOString()
    };

    const updatedDepartments = [...departments, newDept];
    setDepartments(updatedDepartments);
    saveDepartments(updatedDepartments);

    toast({
      title: "Department added",
      description: `${newDepartment.name} has been added successfully.`,
    });

    setNewDepartment({
      name: '',
      description: '',
      institutionId: '',
      headOfDepartment: ''
    });
    setIsDepartmentDialogOpen(false);
  };

  const editDepartment = (dept: Department) => {
    setNewDepartment({
      name: dept.name,
      description: dept.description,
      institutionId: dept.institutionId,
      headOfDepartment: dept.headOfDepartment
    });
    setEditingDepartment(dept);
    setIsDepartmentDialogOpen(true);
  };

  const updateDepartment = () => {
    if (!newDepartment.name.trim() || !newDepartment.institutionId) {
      toast({
        title: "Required fields",
        description: "Please enter department name and select institution.",
        variant: "destructive",
      });
      return;
    }

    const updatedDepartments = departments.map(dept => 
      dept.id === editingDepartment?.id 
        ? {
            ...dept,
            name: newDepartment.name,
            description: newDepartment.description,
            institutionId: newDepartment.institutionId,
            headOfDepartment: newDepartment.headOfDepartment
          }
        : dept
    );

    setDepartments(updatedDepartments);
    saveDepartments(updatedDepartments);

    toast({
      title: "Department updated",
      description: `${newDepartment.name} has been updated successfully.`,
    });

    setNewDepartment({
      name: '',
      description: '',
      institutionId: '',
      headOfDepartment: ''
    });
    setEditingDepartment(null);
    setIsDepartmentDialogOpen(false);
  };

  const saveDepartments = (departmentsToSave: Department[]) => {
    try {
      localStorage.setItem('admin_departments', JSON.stringify(departmentsToSave));
      console.log('💾 Departments saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving departments:', error);
    }
  };

  const saveAcademicYears = (yearsToSave: AcademicYear[]) => {
    try {
      localStorage.setItem('admin_academic_years', JSON.stringify(yearsToSave));
      console.log('💾 Academic years saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving academic years:', error);
    }
  };

  const saveStaffMembers = (staffToSave: StaffMember[]) => {
    try {
      localStorage.setItem('admin_staff_members', JSON.stringify(staffToSave));
      console.log('💾 Staff members saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving staff members:', error);
    }
  };

  const savePerformanceMetrics = (metricsToSave: PerformanceMetric[]) => {
    try {
      localStorage.setItem('admin_performance_metrics', JSON.stringify(metricsToSave));
      console.log('💾 Performance metrics saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving performance metrics:', error);
    }
  };

  const saveAnnouncements = (announcementsToSave: Announcement[]) => {
    try {
      localStorage.setItem('admin_announcements', JSON.stringify(announcementsToSave));
      console.log('💾 Announcements saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving announcements:', error);
    }
  };

  const deleteDepartment = (departmentId: string) => {
    const department = departments.find(dept => dept.id === departmentId);
    if (!department) return;

    const updatedDepartments = departments.filter(dept => dept.id !== departmentId);
    setDepartments(updatedDepartments);
    saveDepartments(updatedDepartments);

    // Update stats
    setTimeout(() => updateStatsFromData(), 100);

    toast({
      title: "Department deleted",
      description: `${department.name} has been removed successfully.`,
    });
  };

  // Academic Year Management Functions
  const addAcademicYear = () => {
    if (!newYear.year.trim() || !newYear.startDate || !newYear.endDate) {
      toast({
        title: "Required fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newAcademicYear: AcademicYear = {
      id: Date.now().toString(),
      year: newYear.year,
      startDate: newYear.startDate,
      endDate: newYear.endDate,
      isActive: false,
      createdAt: new Date().toISOString()
    };

    const updatedYears = [...academicYears, newAcademicYear];
    setAcademicYears(updatedYears);
    saveAcademicYears(updatedYears);

    toast({
      title: "Academic year added",
      description: `${newYear.year} has been added successfully.`,
    });

    // Reset form
    setNewYear({ year: '', startDate: '', endDate: '' });
    setIsYearDialogOpen(false);
  };

  const activateAcademicYear = (yearId: string) => {
    const updatedYears = academicYears.map(year => ({
      ...year,
      isActive: year.id === yearId
    }));
    setAcademicYears(updatedYears);
    saveAcademicYears(updatedYears);

    const year = academicYears.find(y => y.id === yearId);
    toast({
      title: "Academic year activated",
      description: `${year?.year} is now the active academic year.`,
    });
  };

  // Staff Management Functions
  const approveStaff = (staffId: string) => {
    const updatedStaff = staffMembers.map(staff =>
      staff.id === staffId ? { ...staff, status: 'approved' as const } : staff
    );
    setStaffMembers(updatedStaff);
    saveStaffMembers(updatedStaff);

    const staff = staffMembers.find(s => s.id === staffId);
    toast({
      title: "Staff approved",
      description: `${staff?.name} has been approved successfully.`,
    });

    // Update stats
    setTimeout(() => updateStatsFromData(), 100);
  };

  const rejectStaff = (staffId: string) => {
    const updatedStaff = staffMembers.map(staff =>
      staff.id === staffId ? { ...staff, status: 'rejected' as const } : staff
    );
    setStaffMembers(updatedStaff);
    saveStaffMembers(updatedStaff);

    const staff = staffMembers.find(s => s.id === staffId);
    toast({
      title: "Staff rejected",
      description: `${staff?.name} has been rejected.`,
    });

    // Update stats
    setTimeout(() => updateStatsFromData(), 100);
  };

  // Announcement Management Functions
  const addAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      toast({
        title: "Required fields",
        description: "Please enter title and message.",
        variant: "destructive",
      });
      return;
    }

    const newAnnouncementData: Announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      message: newAnnouncement.message,
      priority: newAnnouncement.priority,
      targetAudience: newAnnouncement.targetAudience,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const updatedAnnouncements = [...announcements, newAnnouncementData];
    setAnnouncements(updatedAnnouncements);
    saveAnnouncements(updatedAnnouncements);

    // Update stats
    setTimeout(() => updateStatsFromData(), 100);

    toast({
      title: "Announcement created",
      description: `${newAnnouncement.title} has been published successfully.`,
    });

    // Reset form
    setNewAnnouncement({ title: '', message: '', priority: 'medium', targetAudience: 'all' });
    setIsAnnouncementDialogOpen(false);
  };

  const toggleAnnouncement = (announcementId: string) => {
    const updatedAnnouncements = announcements.map(announcement =>
      announcement.id === announcementId 
        ? { ...announcement, isActive: !announcement.isActive }
        : announcement
    );
    setAnnouncements(updatedAnnouncements);
    saveAnnouncements(updatedAnnouncements);

    // Update stats
    setTimeout(() => updateStatsFromData(), 100);
  };

  // Teacher Management Functions
  const toggleDepartmentExpansion = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
    }
    setExpandedDepartments(newExpanded);
  };

  const openTeacherEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setTeacherEditForm({
      name: teacher.name,
      email: teacher.email,
      department_name: teacher.department_name || '',
      university: teacher.university || '',
      approved: teacher.approved
    });
    setIsTeacherEditDialogOpen(true);
  };

  const updateTeacher = async () => {
    if (!editingTeacher) return;

    setIsUpdatingTeacher(true);
    try {
      const result = await updateTeacherSupabase(editingTeacher.id, {
        name: teacherEditForm.name,
        email: teacherEditForm.email,
        department_name: teacherEditForm.department_name,
        university: teacherEditForm.university,
        approved: teacherEditForm.approved
      });

      if (result.success) {
        toast({
          title: "Teacher updated",
          description: `${teacherEditForm.name}'s information has been updated successfully.`,
        });

        // Close dialog and reset form
        setIsTeacherEditDialogOpen(false);
        setEditingTeacher(null);
        setTeacherEditForm({
          name: '',
          email: '',
          department_name: '',
          university: '',
          approved: false
        });
      } else {
        throw new Error(result.error || 'Update failed');
      }

    } catch (error) {
      console.error('❌ Error updating teacher:', error);
      toast({
        title: "Update failed",
        description: "Failed to update teacher information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingTeacher(false);
    }
  };

  // Clear all data function
  const clearAllData = () => {
    localStorage.removeItem('admin_departments');
    localStorage.removeItem('admin_academic_years');
    localStorage.removeItem('admin_staff_members');
    localStorage.removeItem('admin_performance_metrics');
    localStorage.removeItem('admin_announcements');
    localStorage.removeItem('admin_stats');
    localStorage.removeItem('admin_platform_usage');

    // Reset all state
    setDepartments([]);
    setAcademicYears([]);
    setStaffMembers([]);
    setPerformanceMetrics([]);
    setAnnouncements([]);
    setStats({
      totalUsers: 0,
      totalTeachers: 0,
      totalStudents: 0,
      activeInstitutions: 0,
      pendingStaff: 0,
      totalDepartments: 0,
      activeAnnouncements: 0
    });
    setPlatformUsage([
      { platform: 'LeetCode', users: 0, percentage: 0 },
      { platform: 'GeeksforGeeks', users: 0, percentage: 0 },
      { platform: 'HackerRank', users: 0, percentage: 0 },
      { platform: 'CodeChef', users: 0, percentage: 0 },
      { platform: 'HackerEarth', users: 0, percentage: 0 },
      { platform: 'Codeforces', users: 0, percentage: 0 },
      { platform: 'AtCoder', users: 0, percentage: 0 },
      { platform: 'TopCoder', users: 0, percentage: 0 },
      { platform: 'CSES Problem Set', users: 0, percentage: 0 },
      { platform: 'InterviewBit', users: 0, percentage: 0 }
    ]);
    
    toast({
      title: "Data cleared",
      description: "All admin data has been cleared successfully.",
    });
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (userRole && userRole !== 'ADMIN') {
        // Redirect to appropriate dashboard based on role
        switch (userRole) {
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || userRole !== 'ADMIN') {
    return null; // Will redirect via useEffect
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Teachers"
            value={stats.totalTeachers}
            icon={GraduationCap}
            gradient="from-green-500 to-emerald-500"
            delay={0}
          />
          <StatCard
            title="Students"
            value={stats.totalStudents}
            icon={Users}
            gradient="from-blue-500 to-cyan-500"
            delay={0.1}
          />
          <StatCard
            title="Departments"
            value={stats.totalDepartments}
            icon={Building2}
            gradient="from-orange-500 to-red-500"
            delay={0.2}
          />
          <StatCard
            title="Pending Teachers"
            value={stats.pendingTeachers}
            icon={Clock}
            gradient="from-yellow-500 to-orange-500"
            delay={0.3}
          />
          <StatCard
            title="Active Announcements"
            value={stats.activeAnnouncements}
            icon={Megaphone}
            gradient="from-indigo-500 to-purple-500"
            delay={0.4}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="staff">Staff Approval</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Platform Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
                <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Platform Usage
                    </CardTitle>
                    <CardDescription>User distribution across platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {platformUsage.map((platform) => (
                          <div key={platform.platform} className="space-y-2 p-3 rounded-lg bg-muted/20">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">{platform.platform}</span>
                              <span className="text-xs text-muted-foreground">
                                {platform.users} users ({platform.percentage}%)
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                style={{ width: `${platform.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        Total platforms: {platformUsage.length} • All platforms start at 0% usage
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Department Management
                  </CardTitle>
                    <CardDescription>View approved teachers organized by department</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {teacherData ? `${teacherData.approvedTeachers} Approved Teachers` : 'Loading...'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {teachersLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading teacher data...</p>
                </div>
              ) : !teacherData || teacherData.departments.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No approved teachers yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Teachers will appear here once they are approved by administrators
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teacherData.departments.map((dept) => {
                    const isExpanded = expandedDepartments.has(dept.id);
                    
                    return (
                      <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-primary/10 overflow-hidden"
                      >
                        {/* Department Header */}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-white" />
                              </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">{dept.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {dept.university} • {dept.teacherCount} approved teachers
                                  </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => toggleDepartmentExpansion(dept.id)}
                                className="border-primary/20 text-primary hover:bg-primary/10"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <span className="ml-1">
                                  {dept.teacherCount} Teachers
                                </span>
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Teachers List */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-primary/10 bg-background/50"
                          >
                            {dept.teachers.length === 0 ? (
                              <div className="p-6 text-center">
                                <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  No approved teachers in this department yet
                                </p>
                              </div>
                            ) : (
                              <div className="p-4">
                                <div className="mb-3">
                                  <h5 className="font-medium text-sm text-muted-foreground mb-2">
                                    Approved Teachers in {dept.name}
                                  </h5>
                                </div>
                                <div className="space-y-3">
                                  {dept.teachers.map((teacher) => (
                                    <motion.div
                                      key={teacher.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-primary/5"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                          <UserIcon className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                          <h6 className="font-medium">{teacher.name}</h6>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            <span>{teacher.email}</span>
                                          </div>
                                          {teacher.university && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {teacher.university}
                                            </p>
                                          )}
                                          {teacher.department_name && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              Department: {teacher.department_name}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge 
                                          variant="default"
                                          className="text-xs bg-green-100 text-green-800"
                                        >
                                          Approved
                                        </Badge>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => openTeacherEditDialog(teacher)}
                                          className="border-primary/20 text-primary hover:bg-primary/10"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>

          {/* Teacher Approval Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Teacher Approval Management
                </CardTitle>
                <CardDescription>Review and approve teacher applications</CardDescription>
              </CardHeader>
              <CardContent>
                    {pendingTeachers.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending teacher applications</h3>
                    <p className="text-muted-foreground mb-4">
                      Teacher applications will appear here for review
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                        <TableBody>
                          {pendingTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium">{teacher.name}</TableCell>
                          <TableCell>{teacher.email}</TableCell>
                          <TableCell>{teacher.college_name || 'N/A'}</TableCell>
                          <TableCell>{teacher.department || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={teacher.status === 'approved' ? 'default' : teacher.status === 'rejected' ? 'destructive' : 'secondary'}
                            >
                              {teacher.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(teacher.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {teacher.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => approveTeacher(teacher.id)}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => rejectTeacher(teacher.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
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

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Performance Analytics
                </CardTitle>
                <CardDescription>Track department and student performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceMetrics.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No performance data</h3>
                    <p className="text-muted-foreground mb-4">
                      Performance metrics will be displayed here as data becomes available
                    </p>
                  </div>
                ) : (
                <div className="space-y-6">
                    {performanceMetrics.map((metric) => (
                      <div key={metric.id} className="p-4 rounded-lg bg-muted/20">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">{metric.departmentName}</h4>
                        <span className="text-sm text-muted-foreground">
                            {metric.studentsCount} students
                        </span>
                      </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Average Score</span>
                              <span className="text-sm text-muted-foreground">{metric.averageScore}%</span>
                  </div>
                            <Progress value={metric.averageScore} className="h-2" />
                    </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Completion Rate</span>
                              <span className="text-sm text-muted-foreground">{metric.completionRate}%</span>
                  </div>
                            <Progress value={metric.completionRate} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Platform Usage</span>
                              <span className="text-sm text-muted-foreground">{metric.platformUsage}%</span>
                            </div>
                            <Progress value={metric.platformUsage} className="h-2" />
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Announcement Management
                </CardTitle>
                    <CardDescription>Create and manage announcements for staff and students</CardDescription>
                    </div>
                  <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-primary to-secondary">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Announcement
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                        <DialogDescription>
                          Create an announcement for staff and students
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="announcement-title">Title</Label>
                          <Input
                            id="announcement-title"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter announcement title"
                          />
                  </div>
                        <div>
                          <Label htmlFor="announcement-message">Message</Label>
                          <Textarea
                            id="announcement-message"
                            value={newAnnouncement.message}
                            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Enter announcement message"
                            rows={4}
                          />
                </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="announcement-priority">Priority</Label>
                            <Select value={newAnnouncement.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewAnnouncement(prev => ({ ...prev, priority: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="announcement-audience">Target Audience</Label>
                            <Select value={newAnnouncement.targetAudience} onValueChange={(value: 'all' | 'teachers' | 'students') => setNewAnnouncement(prev => ({ ...prev, targetAudience: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select audience" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="teachers">Teachers</SelectItem>
                                <SelectItem value="students">Students</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={addAnnouncement}>
                            Create Announcement
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first announcement to communicate with staff and students
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-primary to-secondary"
                      onClick={() => setIsAnnouncementDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Announcement
                    </Button>
                    </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{announcement.title}</h4>
                              <Badge 
                                variant={announcement.priority === 'high' ? 'destructive' : announcement.priority === 'medium' ? 'default' : 'secondary'}
                              >
                                {announcement.priority}
                              </Badge>
                              <Badge variant="outline">
                                {announcement.targetAudience}
                              </Badge>
                              {announcement.isActive && (
                                <Badge className="bg-green-500">Active</Badge>
                              )}
                  </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {announcement.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(announcement.createdAt).toLocaleDateString()}
                            </p>
                    </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => toggleAnnouncement(announcement.id)}
                              className={announcement.isActive ? "border-red-500/20 text-red-600 hover:bg-red-500/10" : "border-green-500/20 text-green-600 hover:bg-green-500/10"}
                            >
                              {announcement.isActive ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                  </div>
                    </div>
                  </div>
                    ))}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Teacher Edit Dialog */}
        <Dialog open={isTeacherEditDialogOpen} onOpenChange={setIsTeacherEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Teacher Information</DialogTitle>
              <DialogDescription>
                Update teacher details and status
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-name">Name</Label>
                <Input
                  id="teacher-name"
                  value={teacherEditForm.name}
                  onChange={(e) => setTeacherEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter teacher name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  value={teacherEditForm.email}
                  onChange={(e) => setTeacherEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter teacher email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-department">Department</Label>
                <Input
                  id="teacher-department"
                  value={teacherEditForm.department_name}
                  onChange={(e) => setTeacherEditForm(prev => ({ ...prev, department_name: e.target.value }))}
                  placeholder="Enter department name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-university">University</Label>
                <Input
                  id="teacher-university"
                  value={teacherEditForm.university}
                  onChange={(e) => setTeacherEditForm(prev => ({ ...prev, university: e.target.value }))}
                  placeholder="Enter university name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-approved">Approval Status</Label>
                <Select 
                  value={teacherEditForm.approved ? 'approved' : 'pending'} 
                  onValueChange={(value: 'approved' | 'pending') => 
                    setTeacherEditForm(prev => ({ ...prev, approved: value === 'approved' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approval status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsTeacherEditDialogOpen(false);
                  setEditingTeacher(null);
                  setTeacherEditForm({
                    name: '',
                    email: '',
                    department_name: '',
                    university: '',
                    approved: false
                  });
                }}
                disabled={isUpdatingTeacher}
              >
                Cancel
              </Button>
              <Button 
                onClick={updateTeacher}
                disabled={isUpdatingTeacher}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                {isUpdatingTeacher ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Teacher
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
