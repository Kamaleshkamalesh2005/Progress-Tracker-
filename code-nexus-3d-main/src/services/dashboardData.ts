// Centralized Dashboard Data Management Service
// This service manages data flow between all dashboards: Super Admin → Admin → Staff → Student

export interface DashboardData {
  // User Management
  users: User[];
  pendingApprovals: PendingApproval[];
  
  // Student Progress Data
  studentProgress: StudentProgress[];
  
  // Platform Connections
  platformConnections: PlatformConnection[];
  
  // Announcements
  announcements: Announcement[];
  
  // Statistics
  statistics: DashboardStatistics;
  
  // Notifications
  notifications: Notification[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';
  status: 'pending' | 'approved' | 'rejected';
  college_id?: string;
  college_name?: string;
  department?: string;
  section?: string;
  year?: string;
  rollNumber?: string;
  created_at: string;
  updated_at: string;
}

export interface PendingApproval {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  college_name?: string;
  department?: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export interface StudentProgress {
  userId: string;
  userName: string;
  userEmail: string;
  college_name?: string;
  department?: string;
  totalProblemsSolved: number;
  currentStreak: number;
  maxStreak: number;
  badgesEarned: number;
  platformStats: PlatformStats[];
  lastActive: string;
  isActive: boolean;
}

export interface PlatformStats {
  platform: string;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  maxStreak: number;
  badges: number;
  lastSynced: string;
}

export interface PlatformConnection {
  id: string;
  userId: string;
  platform: string;
  username: string;
  isVerified: boolean;
  lastSynced: string;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  maxStreak: number;
  badges: number;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'super_admin' | 'admin' | 'teacher' | 'student';
  createdBy: string;
  createdByRole: string;
  createdAt: string;
  isActive: boolean;
}

export interface DashboardStatistics {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalStaff: number;
  pendingStudents: number;
  pendingTeachers: number;
  pendingAdmins: number;
  totalProblemsSolved: number;
  totalBadgesEarned: number;
  averageStreak: number;
  activeUsers: number;
  inactiveUsers: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'announcement' | 'progress' | 'system';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  actionRequired?: boolean;
}

class DashboardDataService {
  private static instance: DashboardDataService;
  private data: DashboardData;
  private listeners: Map<string, (data: DashboardData) => void> = new Map();

  private constructor() {
    this.data = this.initializeData();
    this.loadFromStorage();
  }

  public static getInstance(): DashboardDataService {
    if (!DashboardDataService.instance) {
      DashboardDataService.instance = new DashboardDataService();
    }
    return DashboardDataService.instance;
  }

  private initializeData(): DashboardData {
    return {
      users: [],
      pendingApprovals: [],
      studentProgress: [],
      platformConnections: [],
      announcements: [],
      statistics: {
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
        totalStaff: 0,
        pendingStudents: 0,
        pendingTeachers: 0,
        pendingAdmins: 0,
        totalProblemsSolved: 0,
        totalBadgesEarned: 0,
        averageStreak: 0,
        activeUsers: 0,
        inactiveUsers: 0
      },
      notifications: []
    };
  }

  private loadFromStorage(): void {
    try {
      const savedData = localStorage.getItem('dashboard-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        this.data = { ...this.data, ...parsedData };
        console.log('✅ Loaded dashboard data from storage');
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('dashboard-data', JSON.stringify(this.data));
      console.log('💾 Saved dashboard data to storage');
    } catch (error) {
      console.error('❌ Error saving dashboard data:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      callback(this.data);
    });
  }

  // Subscribe to data changes
  public subscribe(listenerId: string, callback: (data: DashboardData) => void): void {
    this.listeners.set(listenerId, callback);
  }

  // Unsubscribe from data changes
  public unsubscribe(listenerId: string): void {
    this.listeners.delete(listenerId);
  }

  // Get all data
  public getData(): DashboardData {
    return this.data;
  }

  // User Management Methods
  public addUser(user: User): void {
    this.data.users.push(user);
    this.updateStatistics();
    this.saveToStorage();
    this.notifyListeners();
  }

  public updateUser(userId: string, updates: Partial<User>): void {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
      this.updateStatistics();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public approveUser(userId: string, approvedBy: string): void {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.status = 'approved';
      user.updated_at = new Date().toISOString();
      
      // Update pending approval
      const approval = this.data.pendingApprovals.find(p => p.userId === userId);
      if (approval) {
        approval.status = 'approved';
        approval.approvedBy = approvedBy;
        approval.approvedAt = new Date().toISOString();
      }

      // Create notification
      this.createNotification(userId, 'Account Approved', `Your ${user.role.toLowerCase()} account has been approved!`, 'approval', 'high');
      
      this.updateStatistics();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public rejectUser(userId: string, rejectedBy: string): void {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.status = 'rejected';
      user.updated_at = new Date().toISOString();
      
      // Update pending approval
      const approval = this.data.pendingApprovals.find(p => p.userId === userId);
      if (approval) {
        approval.status = 'rejected';
        approval.approvedBy = rejectedBy;
        approval.approvedAt = new Date().toISOString();
      }

      // Create notification
      this.createNotification(userId, 'Account Rejected', `Your ${user.role.toLowerCase()} account has been rejected. Please contact support.`, 'approval', 'high');
      
      this.updateStatistics();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Student Progress Methods
  public updateStudentProgress(progress: StudentProgress): void {
    const existingIndex = this.data.studentProgress.findIndex(p => p.userId === progress.userId);
    if (existingIndex !== -1) {
      this.data.studentProgress[existingIndex] = progress;
    } else {
      this.data.studentProgress.push(progress);
    }
    
    this.updateStatistics();
    this.saveToStorage();
    this.notifyListeners();
  }

  // Platform Connection Methods
  public addPlatformConnection(connection: PlatformConnection): void {
    this.data.platformConnections.push(connection);
    this.updateStatistics();
    this.saveToStorage();
    this.notifyListeners();
  }

  public updatePlatformConnection(connectionId: string, updates: Partial<PlatformConnection>): void {
    const connectionIndex = this.data.platformConnections.findIndex(c => c.id === connectionId);
    if (connectionIndex !== -1) {
      this.data.platformConnections[connectionIndex] = { 
        ...this.data.platformConnections[connectionIndex], 
        ...updates 
      };
      this.updateStatistics();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Announcement Methods
  public addAnnouncement(announcement: Announcement): void {
    this.data.announcements.push(announcement);
    this.saveToStorage();
    this.notifyListeners();
  }

  public updateAnnouncement(announcementId: string, updates: Partial<Announcement>): void {
    const announcementIndex = this.data.announcements.findIndex(a => a.id === announcementId);
    if (announcementIndex !== -1) {
      this.data.announcements[announcementIndex] = { 
        ...this.data.announcements[announcementIndex], 
        ...updates 
      };
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Notification Methods
  public createNotification(
    userId: string, 
    title: string, 
    message: string, 
    type: 'approval' | 'announcement' | 'progress' | 'system',
    priority: 'low' | 'medium' | 'high' = 'medium',
    actionRequired: boolean = false
  ): void {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      userId,
      title,
      message,
      type,
      priority,
      isRead: false,
      createdAt: new Date().toISOString(),
      actionRequired
    };
    
    this.data.notifications.push(notification);
    this.saveToStorage();
    this.notifyListeners();
  }

  public markNotificationAsRead(notificationId: string): void {
    const notification = this.data.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Statistics Update Method
  private updateStatistics(): void {
    const stats = this.data.statistics;
    
    stats.totalUsers = this.data.users.length;
    stats.totalStudents = this.data.users.filter(u => u.role === 'STUDENT').length;
    stats.totalTeachers = this.data.users.filter(u => u.role === 'TEACHER').length;
    stats.totalAdmins = this.data.users.filter(u => u.role === 'ADMIN').length;
    
    stats.pendingStudents = this.data.users.filter(u => u.role === 'STUDENT' && u.status === 'pending').length;
    stats.pendingTeachers = this.data.users.filter(u => u.role === 'TEACHER' && u.status === 'pending').length;
    stats.pendingAdmins = this.data.users.filter(u => u.role === 'ADMIN' && u.status === 'pending').length;
    
    stats.totalProblemsSolved = this.data.platformConnections.reduce((sum, conn) => sum + conn.problemsSolved, 0);
    stats.totalBadgesEarned = this.data.platformConnections.reduce((sum, conn) => sum + conn.badges, 0);
    
    const streaks = this.data.platformConnections.map(conn => conn.currentStreak);
    stats.averageStreak = streaks.length > 0 ? Math.round(streaks.reduce((sum, streak) => sum + streak, 0) / streaks.length) : 0;
    
    stats.activeUsers = this.data.users.filter(u => u.status === 'approved').length;
    stats.inactiveUsers = this.data.users.filter(u => u.status === 'pending' || u.status === 'rejected').length;
  }

  // Get filtered data for specific roles
  public getDataForRole(role: string): Partial<DashboardData> {
    const baseData = {
      users: this.data.users,
      announcements: this.data.announcements.filter(a => 
        a.targetAudience === 'all' || 
        a.targetAudience === role.toLowerCase() ||
        (role === 'SUPER_ADMIN' && ['super_admin', 'admin', 'teacher', 'student'].includes(a.targetAudience)) ||
        (role === 'ADMIN' && ['admin', 'teacher', 'student'].includes(a.targetAudience)) ||
        (role === 'TEACHER' && ['teacher', 'student'].includes(a.targetAudience))
      ),
      notifications: this.data.notifications,
      statistics: this.data.statistics
    };

    switch (role) {
      case 'SUPER_ADMIN':
        return {
          ...baseData,
          pendingApprovals: this.data.pendingApprovals.filter(p => p.role === 'ADMIN'),
          studentProgress: this.data.studentProgress
        };
      case 'ADMIN':
        return {
          ...baseData,
          pendingApprovals: this.data.pendingApprovals.filter(p => p.role === 'TEACHER'),
          studentProgress: this.data.studentProgress
        };
      case 'TEACHER':
        return {
          ...baseData,
          pendingApprovals: this.data.pendingApprovals.filter(p => p.role === 'STUDENT'),
          studentProgress: this.data.studentProgress
        };
      case 'STUDENT':
        return {
          ...baseData,
          platformConnections: this.data.platformConnections
        };
      default:
        return baseData;
    }
  }

  // Initialize with sample data
  public initializeSampleData(): void {
    // Add sample users
    const sampleUsers: User[] = [
      {
        id: 'superadmin_1',
        name: 'Super Admin',
        email: 'superadmin@progress.com',
        role: 'SUPER_ADMIN',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'admin_1',
        name: 'John Admin',
        email: 'admin@progress.com',
        role: 'ADMIN',
        status: 'approved',
        college_name: 'Tech University',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'teacher_1',
        name: 'Dr. Smith',
        email: 'teacher@progress.com',
        role: 'TEACHER',
        status: 'approved',
        college_name: 'Tech University',
        department: 'Computer Science',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'student_1',
        name: 'Alice Student',
        email: 'student@progress.com',
        role: 'STUDENT',
        status: 'approved',
        college_name: 'Tech University',
        department: 'Computer Science',
        section: 'A',
        year: '2024',
        rollNumber: 'CS2024001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    sampleUsers.forEach(user => this.addUser(user));

    // Add sample platform connections for student
    const sampleConnections: PlatformConnection[] = [
      {
        id: 'conn_1',
        userId: 'student_1',
        platform: 'LEETCODE',
        username: 'alice_student',
        isVerified: true,
        lastSynced: new Date().toISOString(),
        problemsSolved: 156,
        easySolved: 94,
        mediumSolved: 47,
        hardSolved: 15,
        currentStreak: 12,
        maxStreak: 28,
        badges: 8
      },
      {
        id: 'conn_2',
        userId: 'student_1',
        platform: 'GEEKSFORGEEKS',
        username: 'alice_student',
        isVerified: true,
        lastSynced: new Date().toISOString(),
        problemsSolved: 89,
        easySolved: 58,
        mediumSolved: 22,
        hardSolved: 9,
        currentStreak: 7,
        maxStreak: 18,
        badges: 5
      },
      {
        id: 'conn_3',
        userId: 'student_1',
        platform: 'HACKERRANK',
        username: 'alice_student',
        isVerified: true,
        lastSynced: new Date().toISOString(),
        problemsSolved: 67,
        easySolved: 47,
        mediumSolved: 17,
        hardSolved: 3,
        currentStreak: 5,
        maxStreak: 14,
        badges: 3
      }
    ];

    sampleConnections.forEach(conn => this.addPlatformConnection(conn));

    // Update student progress
    const studentProgress: StudentProgress = {
      userId: 'student_1',
      userName: 'Alice Student',
      userEmail: 'student@progress.com',
      college_name: 'Tech University',
      department: 'Computer Science',
      totalProblemsSolved: 312,
      currentStreak: 12,
      maxStreak: 28,
      badgesEarned: 16,
      platformStats: sampleConnections.map(conn => ({
        platform: conn.platform,
        problemsSolved: conn.problemsSolved,
        easySolved: conn.easySolved,
        mediumSolved: conn.mediumSolved,
        hardSolved: conn.hardSolved,
        currentStreak: conn.currentStreak,
        maxStreak: conn.maxStreak,
        badges: conn.badges,
        lastSynced: conn.lastSynced
      })),
      lastActive: new Date().toISOString(),
      isActive: true
    };

    this.updateStudentProgress(studentProgress);

    console.log('✅ Initialized sample dashboard data');
  }
}

export default DashboardDataService;

