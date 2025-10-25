import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  Clock,
  UserCheck,
  UserX,
  Activity,
  Megaphone,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherData } from '@/hooks/useTeacherData';
import { formatPlatformName } from '@/services/platforms';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/auth';
import { safeDownloadBlob } from '@/utils/domUtils';

export default function TeacherDashboard() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    students,
    classStats,
    assignments,
    classes,
    announcements,
    studentAlerts,
    loading: teacherLoading,
    error: teacherError,
    refreshData,
    createAssignment,
    createClass,
    approveStudent,
    rejectStudent,
    markStudentActive,
    createAnnouncement,
    sendStudentAlert,
    sendBulkInactivityAlerts,
    exportStudentData,
  } = useTeacherData();

  // React Query for pending students
  const { data: pendingStudents = [], isLoading: pendingStudentsLoading } = useQuery({
    queryKey: ['pendingStudents', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // For now, we'll use the existing AuthService data but filter for pending students
      const allUsers = AuthService.getMockUsers();
      return allUsers.filter(user => 
        user.role === 'STUDENT' && 
        user.status === 'pending' &&
        (user as any).assigned_teacher_id === user?.id
      );
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Mutation for approving students
  const approveStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      // Update in AuthService (mock data)
      const result = await AuthService.approveStudent(studentId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to approve student');
      }
      
      // In a real Supabase implementation, you would do:
      // const { data, error } = await supabase
      //   .from('students')
      //   .update({ 
      //     approved: true, 
      //     approved_at: new Date().toISOString(),
      //     status: 'approved'
      //   })
      //   .eq('id', studentId);
      // 
      // if (error) throw error;
      
      return result;
    },
    onSuccess: (result, studentId) => {
      // Invalidate and refetch pending students
      queryClient.invalidateQueries(['pendingStudents']);
      
      // Also invalidate the main students query
      queryClient.invalidateQueries(['teacherStudents']);
      
      toast({
        title: "Student approved",
        description: "Student has been approved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve student.",
        variant: "destructive",
      });
    },
  });

  // Mutation for rejecting students
  const rejectStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const result = await AuthService.rejectStudent(studentId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to reject student');
      }
      return result;
    },
    onSuccess: (result, studentId) => {
      // Invalidate and refetch pending students
      queryClient.invalidateQueries(['pendingStudents']);
      
      toast({
        title: "Student rejected",
        description: "Student has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject student.",
        variant: "destructive",
      });
    },
  });

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Year and Section selection state
  const [selectedYear, setSelectedYear] = useState('1st Year');
  const [selectedSection, setSelectedSection] = useState('A');
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Dialog states
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedStudentForAlert, setSelectedStudentForAlert] = useState<Student | null>(null);

  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    platform: 'LEETCODE' as 'LEETCODE' | 'GEEKSFORGEEKS' | 'HACKERRANK',
    problemIds: '',
    dueDate: '',
    studentIds: [] as string[]
  });

  const [classForm, setClassForm] = useState({
    name: '',
    description: '',
    subject: ''
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetAudience: 'all' as 'all' | 'selected',
    studentIds: [] as string[]
  });

  const [alertForm, setAlertForm] = useState({
    type: 'inactivity_warning' as 'inactivity_warning' | 'reminder' | 'encouragement' | 'general',
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Calculate stats
  const stats = {
    totalStudents: students.length,
    pendingStudents: students.filter(student => student.status === 'pending').length,
    approvedStudents: students.filter(student => student.status === 'approved').length,
    inactiveStudents: students.filter(student => student.isInactive).length,
    totalProblemsSolved: students.reduce((sum, student) => sum + student.totalProblemsSolved, 0),
    averagePerformance: students.length > 0 ? students.reduce((sum, student) => sum + student.totalProblemsSolved, 0) / students.length : 0,
    activeAnnouncements: announcements.filter(ann => ann.isActive).length
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title.trim() || !assignmentForm.description.trim()) {
      toast({
        title: "Required fields",
        description: "Please fill in title and description.",
        variant: "destructive",
      });
      return;
    }

    const result = await createAssignment({
      title: assignmentForm.title,
      description: assignmentForm.description,
      platform: assignmentForm.platform,
      problemIds: assignmentForm.problemIds.split(',').map(id => id.trim()).filter(id => id),
      dueDate: assignmentForm.dueDate,
      studentIds: assignmentForm.studentIds
    });

    if (result.success) {
      toast({
        title: "Assignment created",
        description: "Assignment has been created successfully.",
      });
      setIsAssignmentDialogOpen(false);
      setAssignmentForm({
        title: '',
        description: '',
        platform: 'LEETCODE',
        problemIds: '',
        dueDate: '',
        studentIds: []
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create assignment.",
        variant: "destructive",
      });
    }
  };

  const handleCreateClass = async () => {
    if (!classForm.name.trim()) {
      toast({
        title: "Required field",
        description: "Please enter class name.",
        variant: "destructive",
      });
      return;
    }

    const result = await createClass({
      name: classForm.name,
      description: classForm.description,
      subject: classForm.subject
    });

    if (result.success) {
      toast({
        title: "Class created",
        description: `${classForm.name} has been created successfully.`,
      });
      setIsClassDialogOpen(false);
      setClassForm({
        name: '',
        description: '',
        subject: ''
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create class.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      toast({
        title: "Required fields",
        description: "Please fill in title and message.",
        variant: "destructive",
      });
      return;
    }

    const result = await createAnnouncement({
      title: announcementForm.title,
      message: announcementForm.message,
      priority: announcementForm.priority,
      targetAudience: announcementForm.targetAudience,
      studentIds: announcementForm.targetAudience === 'selected' ? announcementForm.studentIds : undefined
    });

    if (result.success) {
      toast({
        title: "Announcement created",
        description: "Announcement has been created successfully.",
      });
      setIsAnnouncementDialogOpen(false);
      setAnnouncementForm({
        title: '',
        message: '',
        priority: 'medium',
        targetAudience: 'all',
        studentIds: []
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create announcement.",
        variant: "destructive",
      });
    }
  };

  const handleApproveStudent = async (studentId: string) => {
    approveStudentMutation.mutate(studentId);
  };

  const handleRejectStudent = async (studentId: string) => {
    rejectStudentMutation.mutate(studentId);
  };

  const handleMarkStudentActive = async (studentId: string) => {
    const result = await markStudentActive(studentId);
    if (result.success) {
      toast({
        title: "Student marked active",
        description: "Student has been marked as active.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to mark student active.",
        variant: "destructive",
      });
    }
  };

  const handleSendAlert = async () => {
    if (!selectedStudentForAlert || !alertForm.title.trim() || !alertForm.message.trim()) {
      toast({
        title: "Required fields",
        description: "Please fill in title and message.",
        variant: "destructive",
      });
      return;
    }

    const result = await sendStudentAlert({
      studentId: selectedStudentForAlert.id,
      type: alertForm.type,
      title: alertForm.title,
      message: alertForm.message,
      priority: alertForm.priority
    });

    if (result.success) {
      toast({
        title: "Alert sent",
        description: `Alert has been sent to ${selectedStudentForAlert.name}.`,
      });
      setIsAlertDialogOpen(false);
      setSelectedStudentForAlert(null);
      setAlertForm({
        type: 'inactivity_warning',
        title: '',
        message: '',
        priority: 'medium'
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send alert.",
        variant: "destructive",
      });
    }
  };

  const handleSendBulkInactivityAlerts = async () => {
    const inactiveStudentIds = students.filter(student => student.isInactive).map(student => student.id);
    
    if (inactiveStudentIds.length === 0) {
      toast({
        title: "No inactive students",
        description: "There are no inactive students to alert.",
        variant: "destructive",
      });
      return;
    }

    const result = await sendBulkInactivityAlerts(inactiveStudentIds);
    if (result.success) {
      toast({
        title: "Bulk alerts sent",
        description: `Inactivity warnings sent to ${result.sentCount} students.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send bulk alerts.",
        variant: "destructive",
      });
    }
  };

  const openAlertDialog = (student: Student) => {
    setSelectedStudentForAlert(student);
    setAlertForm({
      type: 'inactivity_warning',
      title: `Inactivity Warning - ${student.name}`,
      message: `Hi ${student.name},\n\nYou haven't been active on coding platforms recently. Please resume your practice to maintain your progress.\n\nBest regards,\nTeacher`,
      priority: 'medium'
    });
    setIsAlertDialogOpen(true);
  };

  const handleExportData = async (platform?: string) => {
    try {
      const result = await exportStudentData(platform);
      if (result.success && result.data) {
        // Convert to CSV
        const csvContent = [
          ['Name', 'Email', 'Roll Number', 'Status', 'Total Problems', 'Easy Problems', 'Medium Problems', 'Hard Problems', 'Current Streak', 'Max Streak', 'Badges', 'Last Active', 'Inactive Days', 'Platform Usernames'].join(','),
          ...result.data.map((student: any) => [
            student.name,
            student.email,
            student.rollNumber || '',
            student.status,
            student.totalProblemsSolved,
            student.easyProblemsSolved,
            student.mediumProblemsSolved,
            student.hardProblemsSolved,
            student.currentStreak,
            student.maxStreak,
            student.badgesEarned,
            new Date(student.lastActive).toLocaleDateString(),
            student.inactiveDays,
            JSON.stringify(student.platformUsernames)
          ].join(','))
        ].join('\n');

        // Download CSV with proper error handling
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const filename = `students_${platform || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
        
        await safeDownloadBlob(blob, filename);

        toast({
          title: "Data exported",
          description: `Student data has been exported successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to export data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Error",
        description: "An error occurred while exporting data.",
        variant: "destructive",
      });
    }
  };

  // Fetch students based on year and section
  const fetchStudents = async (year: string, section: string) => {
    setIsLoadingStudents(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter students based on year and section
      const filtered = students.filter(student => {
        // Check if student has year and section data
        const studentYear = student.year || '1st Year';
        const studentSection = student.section || 'A';
        
        return studentYear === year && studentSection === section;
      });
      
      setFilteredStudents(filtered);
      console.log(`📚 Loaded ${filtered.length} students for ${year} - Section ${section}`);
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students for selected year and section.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Handle year change
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    fetchStudents(year, selectedSection);
  };

  // Handle section change
  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    fetchStudents(selectedYear, section);
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (userRole !== 'TEACHER') {
        navigate('/dashboard');
      }
    }
  }, [user, userRole, loading, navigate]);

  // Initialize filtered students when students data changes
  useEffect(() => {
    if (students.length > 0) {
      fetchStudents(selectedYear, selectedSection);
    }
  }, [students]);

  if (loading || teacherLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading teacher dashboard...</p>
          </div>
      </div>
      </DashboardLayout>
    );
  }

  if (teacherError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive mb-4">{teacherError}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Teacher Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage students, assignments, and track performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={refreshData}
              disabled={teacherLoading}
              className="border-primary/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${teacherLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Pending Students Section */}
        {pendingStudents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-xl border border-orange-500/20 p-6 shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-orange-700 dark:text-orange-300">
                  Pending Student Approvals
                </h2>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  {pendingStudents.length}
                </Badge>
              </div>
            </div>
            
            <div className="grid gap-4">
              {pendingStudents.map((student) => (
                <Card key={student.id} className="border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-semibold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {student.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {student.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {student.rollNumber}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {(student as any).college_name}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {student.department}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveStudent(student.id)}
                          disabled={approveStudentMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          {approveStudentMutation.isPending ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectStudent(student.id)}
                          disabled={rejectStudentMutation.isPending}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          {rejectStudentMutation.isPending ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Year and Section Selector */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20 p-6 shadow-lg backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Filter Students</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Year Selector */}
              <div className="flex flex-col gap-2 min-w-[140px]">
                <Label htmlFor="year-select" className="text-sm font-medium text-muted-foreground">
                  Select Year
                </Label>
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger 
                    id="year-select"
                    className="rounded-lg border-primary/20 bg-background/50 backdrop-blur-sm hover:border-primary/40 transition-colors"
                  >
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-primary/20 bg-background/95 backdrop-blur-sm">
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Section Selector */}
              <div className="flex flex-col gap-2 min-w-[140px]">
                <Label htmlFor="section-select" className="text-sm font-medium text-muted-foreground">
                  Select Section
                </Label>
                <Select value={selectedSection} onValueChange={handleSectionChange}>
                  <SelectTrigger 
                    id="section-select"
                    className="rounded-lg border-primary/20 bg-background/50 backdrop-blur-sm hover:border-primary/40 transition-colors"
                  >
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-primary/20 bg-background/95 backdrop-blur-sm">
                    {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                      <SelectItem key={letter} value={letter}>Section {letter}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Loading Indicator */}
              {isLoadingStudents && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading students...</span>
                </div>
              )}

              {/* Student Count Display */}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>

          {/* No Students Message */}
          {!isLoadingStudents && filteredStudents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 rounded-lg bg-muted/50 border border-muted-foreground/20"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  No students found for {selectedYear} - Section {selectedSection}.
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            gradient="from-blue-500 to-cyan-500"
            delay={0.1}
          />
          <StatCard
            title="Pending Approval"
            value={stats.pendingStudents}
            icon={Clock}
            gradient="from-yellow-500 to-orange-500"
            delay={0.2}
          />
          <StatCard
            title="Avg Problems"
            value={Math.round(stats.averagePerformance)}
            icon={TrendingUp}
            gradient="from-green-500 to-emerald-500"
            delay={0.3}
          />
          <StatCard
            title="Inactive Students"
            value={stats.inactiveStudents}
            icon={AlertTriangle}
            gradient="from-red-500 to-pink-500"
            delay={0.4}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending-approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="approvals">Student Approvals</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Students</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Status Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Student Status Overview
                    </CardTitle>
                    <CardDescription>Current student status distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Approved Students</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-500">
                          {stats.approvedStudents}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-yellow-500" />
                          <span className="font-medium">Pending Approval</span>
                        </div>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                          {stats.pendingStudents}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <span className="font-medium">Inactive Students</span>
                        </div>
                        <Badge variant="outline" className="text-red-600 border-red-500">
                          {stats.inactiveStudents}
                        </Badge>
                      </div>
                  </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Performance Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Performance Summary
                    </CardTitle>
                    <CardDescription>Overall student performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Problems Solved</span>
                        <span className="text-2xl font-bold text-primary">{stats.totalProblemsSolved}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average per Student</span>
                        <span className="text-2xl font-bold text-primary">{Math.round(stats.averagePerformance)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Active Announcements</span>
                        <span className="text-2xl font-bold text-primary">{stats.activeAnnouncements}</span>
                  </div>
                </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending-approvals" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Pending Student Approvals
                  </CardTitle>
                  <CardDescription>
                    Review and approve students from {selectedYear} - Section {selectedSection}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStudents ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading pending students...</p>
                      </div>
                    </div>
                  ) : filteredStudents.filter(student => student.status === 'pending').length === 0 ? (
                    <div className="text-center py-12">
                      <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No pending approvals</h3>
                      <p className="text-muted-foreground">
                        All students in {selectedYear} - Section {selectedSection} have been processed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredStudents
                        .filter(student => student.status === 'pending')
                        .map((student) => (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 rounded-lg border border-primary/20 bg-background/50 backdrop-blur-sm hover:border-primary/40 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary font-semibold">
                                      {student.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-lg">{student.name}</h4>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Department:</span>
                                    <p className="font-medium">{student.department || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Year:</span>
                                    <p className="font-medium">{student.year || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Section:</span>
                                    <p className="font-medium">{student.section || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Applied:</span>
                                    <p className="font-medium">{new Date(student.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveStudent(student.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectStudent(student.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Student Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Student Approval Management
                </CardTitle>
                <CardDescription>Review and approve student applications</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No students yet</h3>
                    <p className="text-muted-foreground">
                      Students will appear here when they register
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{student.name}</h4>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                            {student.rollNumber && (
                              <p className="text-xs text-muted-foreground">Roll: {student.rollNumber}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={student.status === 'approved' ? 'default' : student.status === 'pending' ? 'secondary' : 'destructive'}
                              >
                                {student.status}
                              </Badge>
                              {student.isInactive && (
                                <Badge variant="outline" className="text-red-600 border-red-500">
                                  Inactive ({student.inactiveDays} days)
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {student.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveStudent(student.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectStudent(student.id)}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {student.isInactive && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMarkStudentActive(student.id)}
                              className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              <Activity className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inactive Students Tab */}
          <TabsContent value="inactive" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Inactive Students Management
                    </CardTitle>
                    <CardDescription>Monitor and alert students who haven't been active recently</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSendBulkInactivityAlerts}
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Alert All Inactive
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {students.filter(student => student.isInactive).length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No inactive students</h3>
                    <p className="text-muted-foreground">
                      All students are currently active. Great job!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.filter(student => student.isInactive).map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-red-900">{student.name}</h4>
                            <p className="text-sm text-red-700">{student.email}</p>
                            {student.rollNumber && (
                              <p className="text-xs text-red-600">Roll: {student.rollNumber}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="destructive" className="text-xs">
                                Inactive for {student.inactiveDays} days
                              </Badge>
                              <Badge variant="outline" className="text-xs text-red-600 border-red-500">
                                Last Active: {new Date(student.lastActive).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openAlertDialog(student)}
                            className="border-orange-500 text-orange-600 hover:bg-orange-50"
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Alert
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkStudentActive(student.id)}
                            className="border-green-500 text-green-600 hover:bg-green-50"
                          >
                            <Activity className="h-4 w-4 mr-1" />
                            Mark Active
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Top Performers
                  </CardTitle>
                  <CardDescription>Students with highest problem-solving count</CardDescription>
                </CardHeader>
                <CardContent>
                  {classStats?.topPerformers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No performance data available.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {classStats?.topPerformers.map((student, index) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.totalProblemsSolved} problems</p>
                            </div>
                          </div>
                          <Badge variant="outline">{student.badgesEarned} badges</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

          {/* Recent Activity */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest student achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {classStats?.recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity to show.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classStats?.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-muted/20 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{activity.student.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                        <p className="text-xs text-primary">{formatPlatformName(activity.platform)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
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
                    <CardDescription>Create and manage announcements for students</CardDescription>
                </div>
                  <Button 
                    className="bg-gradient-to-r from-primary to-secondary"
                    onClick={() => setIsAnnouncementDialogOpen(true)}
                  >
                  <Plus className="h-4 w-4 mr-2" />
                    New Announcement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
                {announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first announcement to communicate with students
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
                        className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-primary/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{announcement.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={announcement.priority === 'high' ? 'destructive' : announcement.priority === 'medium' ? 'default' : 'secondary'}
                            >
                              {announcement.priority}
                            </Badge>
                            <Badge variant="outline">
                              {announcement.targetAudience}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {announcement.message}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                          <span>{announcement.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Assignment Management
                    </CardTitle>
                    <CardDescription>Create and manage assignments for your students</CardDescription>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-primary to-secondary"
                    onClick={() => setIsAssignmentDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Assignment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first assignment to start tracking student progress
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-primary to-secondary"
                      onClick={() => setIsAssignmentDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-primary/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{assignment.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {assignment.platform}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {assignment.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{assignment.problemIds.length} problems</span>
                          <span>{assignment.studentIds.length} students assigned</span>
                          <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Data Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Export Student Data
                </CardTitle>
                <CardDescription>Export leaderboard data filtered by coding platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {['LEETCODE', 'GEEKSFORGEEKS', 'HACKERRANK', 'CODECHEF', 'HACKEREARTH', 'CODEFORCES', 'ATCODER', 'TOPCODER', 'CSES', 'INTERVIEWBIT'].map((platform) => (
                      <Button
                        key={platform}
                        variant="outline"
                        onClick={() => handleExportData(platform)}
                        className="flex flex-col items-center gap-2 h-auto p-4"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-xs">{platform}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => handleExportData()}
                      className="w-full bg-gradient-to-r from-primary to-secondary"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All Student Data
                    </Button>
                  </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Create an assignment for your students
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div className="space-y-2">
                <Label htmlFor="assignment-title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="assignment-title"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter assignment title"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-description" className="text-sm font-medium">Description *</Label>
                <Textarea
                  id="assignment-description"
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter assignment description"
                  rows={4}
                  className="w-full resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-platform" className="text-sm font-medium">Platform</Label>
                <Select value={assignmentForm.platform} onValueChange={(value: 'LEETCODE' | 'GEEKSFORGEEKS' | 'HACKERRANK') => setAssignmentForm(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEETCODE">LeetCode</SelectItem>
                    <SelectItem value="GEEKSFORGEEKS">GeeksforGeeks</SelectItem>
                    <SelectItem value="HACKERRANK">HackerRank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-problems" className="text-sm font-medium">Problem IDs (comma-separated)</Label>
                <Input
                  id="assignment-problems"
                  value={assignmentForm.problemIds}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, problemIds: e.target.value }))}
                  placeholder="e.g., 1, 2, 3"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-due" className="text-sm font-medium">Due Date</Label>
                <Input
                  id="assignment-due"
                  type="datetime-local"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)} className="min-w-[80px]">
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment} className="min-w-[120px]">
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Class Dialog */}
        <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Create a new class to organize your students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class-name" className="text-sm font-medium">Class Name *</Label>
                <Input
                  id="class-name"
                  value={classForm.name}
                  onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter class name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="class-description"
                  value={classForm.description}
                  onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter class description"
                  rows={3}
                  className="w-full resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-subject" className="text-sm font-medium">Subject</Label>
                <Input
                  id="class-subject"
                  value={classForm.subject}
                  onChange={(e) => setClassForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter subject"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsClassDialogOpen(false)} className="min-w-[80px]">
                Cancel
              </Button>
              <Button onClick={handleCreateClass} className="min-w-[100px]">
                Create Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Announcement Dialog */}
        <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create an announcement to communicate with your students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement-title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="announcement-title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter announcement title"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-message" className="text-sm font-medium">Message *</Label>
                <Textarea
                  id="announcement-message"
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter announcement message"
                  rows={4}
                  className="w-full resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-priority" className="text-sm font-medium">Priority</Label>
                <Select value={announcementForm.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setAnnouncementForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-audience" className="text-sm font-medium">Target Audience</Label>
                <Select value={announcementForm.targetAudience} onValueChange={(value: 'all' | 'selected') => setAnnouncementForm(prev => ({ ...prev, targetAudience: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="selected">Selected Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)} className="min-w-[80px]">
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement} className="min-w-[120px]">
                Create Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog */}
        <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Send Alert to Student</DialogTitle>
              <DialogDescription>
                Send a personalized alert to {selectedStudentForAlert?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alert-type" className="text-sm font-medium">Alert Type</Label>
                <Select value={alertForm.type} onValueChange={(value: 'inactivity_warning' | 'reminder' | 'encouragement' | 'general') => setAlertForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inactivity_warning">Inactivity Warning</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="encouragement">Encouragement</SelectItem>
                    <SelectItem value="general">General Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="alert-title"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter alert title"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-message" className="text-sm font-medium">Message *</Label>
                <Textarea
                  id="alert-message"
                  value={alertForm.message}
                  onChange={(e) => setAlertForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter alert message"
                  rows={4}
                  className="w-full resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-priority" className="text-sm font-medium">Priority</Label>
                <Select value={alertForm.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setAlertForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAlertDialogOpen(false)} className="min-w-[80px]">
                Cancel
              </Button>
              <Button onClick={handleSendAlert} className="min-w-[100px]">
                Send Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}