// Mock Authentication Service for Progress Tracker
// This works without Supabase for demo purposes

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STUDENT' | 'SUPER_ADMIN' | 'TEACHER';
  college_id?: string;
  college_name?: string;
  department_id?: string;
  batch_id?: string;
  department?: string;
  section?: string;
  year?: string;
  rollNumber?: string;
  status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface College {
  id: string;
  name: string;
  address: string;
  contactInfo: string;
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  totalStaff: number;
  totalStudents: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'STUDENT' | 'SUPER_ADMIN' | 'TEACHER';
  college_id?: string;
  college_name?: string;
  department_id?: string;
  batch_id?: string;
  department?: string;
  section?: string;
  year?: string;
  rollNumber?: string;
}

export interface Notification {
  id: string;
  type: 'student_signup' | 'student_approved' | 'student_rejected' | 'admin_signup' | 'admin_approved' | 'admin_rejected';
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  studentRollNumber?: string;
  studentDepartment?: string;
  studentSection?: string;
  studentYear?: string;
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  collegeId?: string;
  collegeName?: string;
  isRead: boolean;
  created_at: string;
}

// Mock storage for demo purposes
const MOCK_USERS_KEY = 'code-nexus-mock-users';
const CURRENT_USER_KEY = 'code-nexus-current-user';
const NOTIFICATIONS_KEY = 'code-nexus-notifications';
const COLLEGES_KEY = 'code-nexus-colleges';

export class AuthService {
  // Get mock users from localStorage
  static getMockUsers(): User[] {
    try {
      const users = localStorage.getItem(MOCK_USERS_KEY);
      if (users) {
        const parsedUsers = JSON.parse(users);
        // Create default SUPER_ADMIN if none exists
        this.createDefaultSuperAdmin();
        return parsedUsers;
      }
      
      // Initialize with default data
      this.createDefaultSuperAdmin();
      return this.getDefaultMockUsers();
    } catch {
      return [];
    }
  }

  // Get default mock users for demo
  private static getDefaultMockUsers(): User[] {
    const defaultUsers: User[] = [
      {
        id: 'super_admin_1',
        email: 'superadmin@college.edu',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'admin_1',
        email: 'admin@techuniversity.edu',
        name: 'Tech University Admin',
        role: 'ADMIN',
        college_name: 'Tech University',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'admin_2',
        email: 'admin@sciencecollege.edu',
        name: 'Science College Admin',
        role: 'ADMIN',
        college_name: 'Science College',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'admin_3',
        email: 'admin@engineering.edu',
        name: 'Engineering College Admin',
        role: 'ADMIN',
        college_name: 'Engineering College',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'teacher_1',
        email: 'john.doe@techuniversity.edu',
        name: 'John Doe',
        role: 'TEACHER',
        department: 'Computer Science',
        college_name: 'Tech University',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'teacher_2',
        email: 'jane.smith@techuniversity.edu',
        name: 'Jane Smith',
        role: 'TEACHER',
        department: 'Mathematics',
        college_name: 'Tech University',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'teacher_3',
        email: 'mike.wilson@sciencecollege.edu',
        name: 'Mike Wilson',
        role: 'TEACHER',
        department: 'Physics',
        college_name: 'Science College',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'student_1',
        email: 'student1@techuniversity.edu',
        name: 'Alice Johnson',
        role: 'STUDENT',
        department: 'Computer Science',
        college_name: 'Tech University',
        rollNumber: 'CS001',
        year: '3rd Year',
        section: 'A',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'student_2',
        email: 'student2@techuniversity.edu',
        name: 'Bob Smith',
        role: 'STUDENT',
        department: 'Mathematics',
        college_name: 'Tech University',
        rollNumber: 'MATH001',
        year: '2nd Year',
        section: 'B',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'student_3',
        email: 'student3@sciencecollege.edu',
        name: 'Carol Davis',
        role: 'STUDENT',
        department: 'Physics',
        college_name: 'Science College',
        rollNumber: 'PHY001',
        year: '1st Year',
        section: 'A',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'student_4',
        email: 'student4@engineering.edu',
        name: 'David Brown',
        role: 'STUDENT',
        department: 'Mechanical Engineering',
        college_name: 'Engineering College',
        rollNumber: 'ME001',
        year: '4th Year',
        section: 'C',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Save to localStorage
    this.saveMockUsers(defaultUsers);
    return defaultUsers;
  }

  // Save mock users to localStorage
  private static saveMockUsers(users: User[]): void {
    try {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }

  // Get current user from localStorage
  private static getCurrentUserFromStorage(): User | null {
    try {
      const user = localStorage.getItem(CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  // Save current user to localStorage
  static saveCurrentUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        console.log('✅ Current user saved:', { id: user.id, role: user.role });
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
        console.log('✅ Current user cleared (signed out)');
      }
    } catch (error) {
      console.error('❌ Error saving current user:', error);
    }
  }

  // Sign up a new user
  static async signup(data: SignupData): Promise<AuthResponse> {
    try {
      console.log('🔐 Creating new user account...', { email: data.email, role: data.role });

      // Check if user already exists
      const existingUsers = this.getMockUsers();
      const existingUser = existingUsers.find(u => u.email === data.email);
      
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        email: data.email,
        name: data.name,
        role: data.role,
        college_id: data.college_id,
        college_name: data.college_name,
        department_id: data.department_id,
        batch_id: data.batch_id,
        department: data.department,
        section: data.section,
        year: data.year,
        rollNumber: data.rollNumber,
        status: data.role === 'STUDENT' || data.role === 'ADMIN' || data.role === 'TEACHER' ? 'pending' : 'approved', // Students, Admins, and Teachers need approval
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // For students, find and assign to appropriate teacher
      if (data.role === 'STUDENT' && data.college_name && data.department) {
        const assignedTeacher = this.findTeacherForStudent(data.college_name, data.department, existingUsers);
        if (assignedTeacher) {
          // Add teacher assignment to student data
          (newUser as any).assigned_teacher_id = assignedTeacher.id;
          (newUser as any).assigned_teacher_name = assignedTeacher.name;
          console.log(`🎓 Student ${newUser.name} assigned to teacher ${assignedTeacher.name} at ${data.college_name}`);
          
          // Create student record in teacher's data
          this.createStudentRecordForTeacher(newUser, assignedTeacher.id);
        } else {
          console.log(`⚠️ No teacher found for student ${newUser.name} at ${data.college_name} - ${data.department}`);
        }
      }

      // Save user
      existingUsers.push(newUser);
      this.saveMockUsers(existingUsers);
      
      // Create notifications for pending users
      if (data.role === 'STUDENT') {
        this.createStudentSignupNotification(newUser);
      } else if (data.role === 'ADMIN') {
        this.createAdminSignupNotification(newUser);
      } else if (data.role === 'TEACHER') {
        this.createTeacherSignupNotification(newUser);
      }
      
      // Only set as current user if approved (non-pending users)
      if (newUser.status === 'approved') {
        this.saveCurrentUser(newUser);
      }

      console.log('✅ User account created successfully');
      return { success: true, user: newUser };

    } catch (error) {
      console.error('❌ Signup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Sign in existing user
  static async signin(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Signing in user...', { email });

      // For demo purposes, we'll accept any password
      // In a real app, you'd verify the password
      const users = this.getMockUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if user is pending approval
      if ((user.role === 'STUDENT' || user.role === 'ADMIN' || user.role === 'TEACHER') && user.status === 'pending') {
        const roleText = user.role === 'STUDENT' ? 'student' : user.role === 'ADMIN' ? 'admin' : 'teacher';
        const approverRole = user.role === 'STUDENT' ? 'teacher' : user.role === 'ADMIN' ? 'super admin' : 'admin';
        return { success: false, error: `Your ${roleText} account is pending approval. Please wait for ${approverRole} approval.` };
      }

      // Check if user is rejected
      if ((user.role === 'STUDENT' || user.role === 'ADMIN' || user.role === 'TEACHER') && user.status === 'rejected') {
        const roleText = user.role === 'STUDENT' ? 'student' : user.role === 'ADMIN' ? 'admin' : 'teacher';
        return { success: false, error: `Your ${roleText} account has been rejected. Please contact support.` };
      }

      // Save as current user
      this.saveCurrentUser(user);

      console.log('✅ User signed in successfully');
      return { success: true, user };

    } catch (error) {
      console.error('❌ Signin error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Sign out user
  static async signout(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Signing out user...');

      this.saveCurrentUser(null);

      console.log('✅ User signed out successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Signout error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const user = this.getCurrentUserFromStorage();
      return user;

    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  // Check if user has permission for a role
  static hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
      'STUDENT': 1,
      'TEACHER': 2,
      'ADMIN': 3,
      'SUPER_ADMIN': 4
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  }

  // Generate invitation code for teachers/admins (demo version)
  static async generateInvitationCode(
    inviterId: string,
    inviterRole: string,
    inviteeEmail: string,
    inviteeRole: 'STUDENT' | 'TEACHER'
  ): Promise<{ success: boolean; invitationCode?: string; error?: string }> {
    try {
      // Check if inviter has permission
      if (!this.hasPermission(inviterRole, 'TEACHER')) {
        return { success: false, error: 'Insufficient permissions to create invitations' };
      }

      const invitationCode = Math.random().toString(36).substring(2, 15).toUpperCase();
      console.log('✅ Invitation code generated:', invitationCode);
      return { success: true, invitationCode };

    } catch (error) {
      console.error('❌ Generate invitation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Validate invitation code (demo version)
  static async validateInvitationCode(code: string): Promise<{
    success: boolean;
    inviterId?: string;
    inviterRole?: string;
    inviteeEmail?: string;
    inviteeRole?: string;
    error?: string;
  }> {
    try {
      // For demo purposes, accept any code that looks valid
      if (code && code.length >= 8) {
        return {
          success: true,
          inviterId: 'demo-teacher',
          inviterRole: 'TEACHER',
          inviteeEmail: 'student@example.com',
          inviteeRole: 'STUDENT'
        };
      }

      return { success: false, error: 'Invalid invitation code' };

    } catch (error) {
      console.error('❌ Validate invitation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Get notifications for teachers/admins
  static async getNotifications(): Promise<Notification[]> {
    try {
      const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
      return notifications ? JSON.parse(notifications) : [];
    } catch {
      return [];
    }
  }

  // Save notifications to localStorage
  private static saveNotifications(notifications: Notification[]): void {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Create notification for student signup
  private static createStudentSignupNotification(student: User): void {
    try {
      const notifications = this.getNotifications();
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        type: 'student_signup',
        title: 'New Student Registration',
        message: `Student ${student.name} (Roll: ${student.rollNumber}) has registered and is pending approval.`,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentRollNumber: student.rollNumber,
        studentDepartment: student.department,
        studentSection: student.section,
        studentYear: student.year,
        isRead: false,
        created_at: new Date().toISOString()
      };
      
      notifications.push(notification);
      this.saveNotifications(notifications);
      console.log('✅ Student signup notification created');
    } catch (error) {
      console.error('❌ Failed to create notification:', error);
    }
  }

  // Approve student
  static async approveStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getMockUsers();
      const student = users.find(u => u.id === studentId && u.role === 'STUDENT');
      
      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      // Update student status
      student.status = 'approved';
      student.updated_at = new Date().toISOString();
      this.saveMockUsers(users);

      // Create approval notification
      const notifications = this.getNotifications();
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        type: 'student_approved',
        title: 'Student Approved',
        message: `Student ${student.name} (Roll: ${student.rollNumber}) has been approved and can now access their dashboard.`,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentRollNumber: student.rollNumber,
        studentDepartment: student.department,
        studentSection: student.section,
        studentYear: student.year,
        isRead: false,
        created_at: new Date().toISOString()
      };
      
      notifications.push(notification);
      this.saveNotifications(notifications);

      console.log('✅ Student approved successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Approve student error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Reject student
  static async rejectStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getMockUsers();
      const student = users.find(u => u.id === studentId && u.role === 'STUDENT');
      
      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      // Update student status
      student.status = 'rejected';
      student.updated_at = new Date().toISOString();
      this.saveMockUsers(users);

      // Create rejection notification
      const notifications = this.getNotifications();
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        type: 'student_rejected',
        title: 'Student Rejected',
        message: `Student ${student.name} (Roll: ${student.rollNumber}) has been rejected.`,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentRollNumber: student.rollNumber,
        studentDepartment: student.department,
        studentSection: student.section,
        studentYear: student.year,
        isRead: false,
        created_at: new Date().toISOString()
      };
      
      notifications.push(notification);
      this.saveNotifications(notifications);

      console.log('✅ Student rejected successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Reject student error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Get pending students
  static async getPendingStudents(): Promise<User[]> {
    try {
      const users = this.getMockUsers();
      return users.filter(u => u.role === 'STUDENT' && u.status === 'pending');
    } catch (error) {
      console.error('❌ Get pending students error:', error);
      return [];
    }
  }

  // Get pending admins
  static async getPendingAdmins(): Promise<User[]> {
    try {
      const users = this.getMockUsers();
      return users.filter(u => u.role === 'ADMIN' && u.status === 'pending');
    } catch (error) {
      console.error('❌ Get pending admins error:', error);
      return [];
    }
  }

  // Get pending users by role
  static async getPendingUsers(role: 'STUDENT' | 'ADMIN' | 'TEACHER'): Promise<User[]> {
    try {
      const users = this.getMockUsers();
      return users.filter(u => u.role === role && u.status === 'pending');
    } catch (error) {
      console.error('❌ Get pending users error:', error);
      return [];
    }
  }

  // Get all users by role
  static async getAllUsersByRole(role: 'STUDENT' | 'ADMIN' | 'TEACHER'): Promise<User[]> {
    try {
      const users = this.getMockUsers();
      return users.filter(u => u.role === role);
    } catch (error) {
      console.error('❌ Get all users by role error:', error);
      return [];
    }
  }

  // Approve user (generic method)
  static async approveUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getMockUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Update user status
      user.status = 'approved';
      user.updated_at = new Date().toISOString();
      this.saveMockUsers(users);

      console.log('✅ User approved successfully:', { id: user.id, role: user.role });
      return { success: true };
    } catch (error) {
      console.error('❌ Approve user error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Reject user (generic method)
  static async rejectUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getMockUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Update user status
      user.status = 'rejected';
      user.updated_at = new Date().toISOString();
      this.saveMockUsers(users);

      console.log('✅ User rejected successfully:', { id: user.id, role: user.role });
      return { success: true };
    } catch (error) {
      console.error('❌ Reject user error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Suspend user (generic method)
  static async suspendUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getMockUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Update user status
      user.status = 'suspended' as any;
      user.updated_at = new Date().toISOString();
      this.saveMockUsers(users);

      console.log('✅ User suspended successfully:', { id: user.id, role: user.role });
      return { success: true };
    } catch (error) {
      console.error('❌ Suspend user error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Delete user (generic method)
  static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getMockUsers();
      const filteredUsers = users.filter(u => u.id !== userId);
      
      this.saveMockUsers(filteredUsers);

      console.log('✅ User deleted successfully:', { id: userId });
      return { success: true };
    } catch (error) {
      console.error('❌ Delete user error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // College Management Methods
  static async getColleges(): Promise<College[]> {
    try {
      const colleges = localStorage.getItem(COLLEGES_KEY);
      return colleges ? JSON.parse(colleges) : [];
    } catch {
      return [];
    }
  }

  static async createCollege(college: Omit<College, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; college?: College; error?: string }> {
    try {
      const colleges = await this.getColleges();
      const newCollege: College = {
        ...college,
        id: `college_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      colleges.push(newCollege);
      localStorage.setItem(COLLEGES_KEY, JSON.stringify(colleges));
      
      console.log('✅ College created successfully');
      return { success: true, college: newCollege };
    } catch (error) {
      console.error('❌ Create college error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  static async updateCollege(collegeId: string, updates: Partial<College>): Promise<{ success: boolean; error?: string }> {
    try {
      const colleges = await this.getColleges();
      const collegeIndex = colleges.findIndex(c => c.id === collegeId);
      
      if (collegeIndex === -1) {
        return { success: false, error: 'College not found' };
      }
      
      colleges[collegeIndex] = {
        ...colleges[collegeIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(COLLEGES_KEY, JSON.stringify(colleges));
      
      console.log('✅ College updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Update college error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  static async deleteCollege(collegeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const colleges = await this.getColleges();
      const filteredColleges = colleges.filter(c => c.id !== collegeId);
      
      localStorage.setItem(COLLEGES_KEY, JSON.stringify(filteredColleges));
      
      console.log('✅ College deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Delete college error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Admin Approval Methods
  static async approveAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getMockUsers();
      const admin = users.find(u => u.id === adminId && u.role === 'ADMIN');
      
      if (!admin) {
        return { success: false, error: 'Admin not found' };
      }

      // Update admin status
      admin.status = 'approved';
      admin.updated_at = new Date().toISOString();
      this.saveMockUsers(users);

      // Create approval notification
      const notifications = this.getNotifications();
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        type: 'admin_approved',
        title: 'Admin Approved',
        message: `Admin ${admin.name} has been approved and can now manage their college.`,
        adminId: admin.id,
        adminName: admin.name,
        adminEmail: admin.email,
        collegeId: admin.college_id,
        collegeName: admin.college_name,
        isRead: false,
        created_at: new Date().toISOString()
      };
      
      notifications.push(notification);
      this.saveNotifications(notifications);

      console.log('✅ Admin approved successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Approve admin error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  static async rejectAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getMockUsers();
      const admin = users.find(u => u.id === adminId && u.role === 'ADMIN');
      
      if (!admin) {
        return { success: false, error: 'Admin not found' };
      }

      // Update admin status
      admin.status = 'rejected';
      admin.updated_at = new Date().toISOString();
      this.saveMockUsers(users);

      // Create rejection notification
      const notifications = this.getNotifications();
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        type: 'admin_rejected',
        title: 'Admin Rejected',
        message: `Admin ${admin.name} has been rejected.`,
        adminId: admin.id,
        adminName: admin.name,
        adminEmail: admin.email,
        collegeId: admin.college_id,
        collegeName: admin.college_name,
        isRead: false,
        created_at: new Date().toISOString()
      };
      
      notifications.push(notification);
      this.saveNotifications(notifications);

      console.log('✅ Admin rejected successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Reject admin error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Create notification for admin signup
  private static createAdminSignupNotification(admin: User): void {
    try {
      const notifications = this.getNotifications();
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        type: 'admin_signup',
        title: 'New Admin Registration',
        message: `Admin ${admin.name} has registered for college ${admin.college_name} and is pending approval.`,
        adminId: admin.id,
        adminName: admin.name,
        adminEmail: admin.email,
        collegeId: admin.college_id,
        collegeName: admin.college_name,
        isRead: false,
        created_at: new Date().toISOString()
      };
      
      notifications.push(notification);
      this.saveNotifications(notifications);
      console.log('✅ Admin signup notification created');
    } catch (error) {
      console.error('❌ Failed to create admin notification:', error);
    }
  }

  // Create notification for teacher signup
  private static createTeacherSignupNotification(teacher: User): void {
    try {
      const notifications = this.getNotifications();
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        type: 'admin_signup',
        title: 'New Teacher Registration',
        message: `Teacher ${teacher.name} from ${teacher.college_name} has registered and is pending approval.`,
        adminId: teacher.id,
        adminName: teacher.name,
        adminEmail: teacher.email,
        collegeId: teacher.college_id,
        collegeName: teacher.college_name,
        isRead: false,
        created_at: new Date().toISOString()
      };
      
      notifications.push(notification);
      this.saveNotifications(notifications);
      console.log('✅ Teacher signup notification created');
    } catch (error) {
      console.error('❌ Failed to create teacher notification:', error);
    }
  }

  // Create notification for student signup
  private static createStudentSignupNotification(student: User): void {
    try {
      const notifications = this.getNotifications();
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        type: 'student_signup',
        title: 'New Student Registration',
        message: `Student ${student.name} (Roll: ${student.rollNumber}) has registered and is pending approval.`,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentRollNumber: student.rollNumber,
        studentDepartment: student.department,
        studentSection: student.section,
        studentYear: student.year,
        isRead: false,
        created_at: new Date().toISOString()
      };
      
      notifications.push(notification);
      this.saveNotifications(notifications);
      console.log('✅ Student signup notification created');
    } catch (error) {
      console.error('❌ Failed to create student notification:', error);
    }
  }

  // Create default SUPER_ADMIN user for testing
  static createDefaultSuperAdmin(): void {
    try {
      const users = this.getMockUsersDirect();
      const existingSuperAdmin = users.find(u => u.role === 'SUPER_ADMIN');
      
      if (!existingSuperAdmin) {
        const superAdmin: User = {
          id: 'super_admin_default',
          email: 'superadmin@progress.com',
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        users.push(superAdmin);
        this.saveMockUsers(users);
        console.log('✅ Default SUPER_ADMIN user created:', superAdmin);
      } else {
        console.log('✅ SUPER_ADMIN user already exists:', existingSuperAdmin);
      }
    } catch (error) {
      console.error('❌ Failed to create default SUPER_ADMIN:', error);
    }
  }

  // Direct method to get users without auto-creation
  private static getMockUsersDirect(): User[] {
    try {
      const users = localStorage.getItem(MOCK_USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  // Get current authenticated user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = localStorage.getItem(CURRENT_USER_KEY);
      if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user && user.id) {
          console.log('✅ Current user found:', { id: user.id, role: user.role });
          return user;
        } else {
          console.log('⚠️ Invalid user data in localStorage');
          localStorage.removeItem(CURRENT_USER_KEY);
          return null;
        }
      }
      console.log('ℹ️ No current user found in localStorage');
      return null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      // Clear invalid data
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
  }


  // Get notifications from localStorage
  static getNotifications(): Notification[] {
    try {
      const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      return [];
    }
  }

  // Save notifications to localStorage
  static saveNotifications(notifications: Notification[]): void {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
      console.log('✅ Notifications saved:', notifications.length);
    } catch (error) {
      console.error('❌ Error saving notifications:', error);
    }
  }

  // Test method to manually login as SUPER_ADMIN
  static async testSuperAdminLogin(): Promise<void> {
    try {
      console.log('🧪 Testing SUPER_ADMIN login...');
      const users = this.getMockUsersDirect();
      const superAdmin = users.find(u => u.role === 'SUPER_ADMIN');
      
      if (superAdmin) {
        this.saveCurrentUser(superAdmin);
        console.log('✅ SUPER_ADMIN login successful:', superAdmin);
      } else {
        console.log('❌ No SUPER_ADMIN user found');
      }
    } catch (error) {
      console.error('❌ Error in testSuperAdminLogin:', error);
    }
  }

  // Teacher mapping functionality
  static async getPendingStudentsForTeacher(teacherId: string): Promise<User[]> {
    try {
      const users = this.getMockUsers();
      const teacher = users.find(u => u.id === teacherId && u.role === 'TEACHER');
      
      if (!teacher) {
        console.log('❌ Teacher not found:', teacherId);
        return [];
      }

      // Filter students by teacher's department, year, and section
      const pendingStudents = users.filter(user => 
        user.role === 'STUDENT' && 
        user.status === 'pending' &&
        user.department === teacher.department &&
        user.year === teacher.year &&
        user.section === teacher.section
      );

      console.log(`📚 Found ${pendingStudents.length} pending students for teacher ${teacher.name}`);
      return pendingStudents;
    } catch (error) {
      console.error('❌ Error getting pending students for teacher:', error);
      return [];
    }
  }

  // Approve student
  static async approveStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getMockUsers();
      const student = users.find(u => u.id === studentId);
      
      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      student.status = 'approved';
      student.updated_at = new Date().toISOString();
      this.saveMockUsers(users);
      
      console.log('✅ Student approved successfully:', { id: student.id, name: student.name });
      return { success: true };
    } catch (error) {
      console.error('❌ Error approving student:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Reject student
  static async rejectStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getMockUsers();
      const student = users.find(u => u.id === studentId);
      
      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      student.status = 'rejected';
      student.updated_at = new Date().toISOString();
      this.saveMockUsers(users);
      
      console.log('✅ Student rejected successfully:', { id: student.id, name: student.name });
      return { success: true };
    } catch (error) {
      console.error('❌ Error rejecting student:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Find appropriate teacher for student based on college and department
  static findTeacherForStudent(collegeName: string, department: string, users: User[]): User | null {
    try {
      // First, try to find a teacher with exact college and department match
      const exactMatch = users.find(user => 
        user.role === 'TEACHER' && 
        user.status === 'approved' &&
        user.college_name?.toLowerCase() === collegeName.toLowerCase() &&
        user.department?.toLowerCase() === department.toLowerCase()
      );

      if (exactMatch) {
        console.log(`🎯 Found exact match: Teacher ${exactMatch.name} at ${collegeName} - ${department}`);
        return exactMatch;
      }

      // If no exact match, try to find a teacher with same college (any department)
      const collegeMatch = users.find(user => 
        user.role === 'TEACHER' && 
        user.status === 'approved' &&
        user.college_name?.toLowerCase() === collegeName.toLowerCase()
      );

      if (collegeMatch) {
        console.log(`🏫 Found college match: Teacher ${collegeMatch.name} at ${collegeName}`);
        return collegeMatch;
      }

      // If no college match, try to find any approved teacher with same department
      const departmentMatch = users.find(user => 
        user.role === 'TEACHER' && 
        user.status === 'approved' &&
        user.department?.toLowerCase() === department.toLowerCase()
      );

      if (departmentMatch) {
        console.log(`📚 Found department match: Teacher ${departmentMatch.name} - ${department}`);
        return departmentMatch;
      }

      console.log(`❌ No suitable teacher found for ${collegeName} - ${department}`);
      return null;
    } catch (error) {
      console.error('❌ Error finding teacher for student:', error);
      return null;
    }
  }

  // Create student record in teacher's data for dashboard display
  static createStudentRecordForTeacher(student: User, teacherId: string): void {
    try {
      const existingStudents = JSON.parse(localStorage.getItem('teacher_students') || '[]');
      
      const studentRecord = {
        id: student.id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        role: 'STUDENT' as const,
        status: student.status,
        platformStats: [],
        platformUsernames: {},
        totalProblemsSolved: 0,
        easyProblemsSolved: 0,
        mediumProblemsSolved: 0,
        hardProblemsSolved: 0,
        currentStreak: 0,
        maxStreak: 0,
        badgesEarned: 0,
        lastActive: student.created_at,
        isInactive: false,
        inactiveDays: 0,
        teacherId: teacherId,
        createdAt: student.created_at,
        college_name: student.college_name,
        department: student.department,
        section: student.section,
        year: student.year
      };

      // Check if student already exists
      const existingStudent = existingStudents.find((s: any) => s.id === student.id);
      if (!existingStudent) {
        existingStudents.push(studentRecord);
        localStorage.setItem('teacher_students', JSON.stringify(existingStudents));
        console.log(`📝 Student record created for teacher ${teacherId}:`, studentRecord.name);
      } else {
        console.log(`📝 Student record already exists for teacher ${teacherId}:`, studentRecord.name);
      }
    } catch (error) {
      console.error('❌ Error creating student record for teacher:', error);
    }
  }

  // Approve student
  static async approveStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🎓 Approving student:', studentId);
      
      // Update in main users data
      const users = this.getMockUsers();
      const updatedUsers = users.map(user => 
        user.id === studentId 
          ? { 
              ...user, 
              status: 'approved' as const,
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : user
      );
      this.saveMockUsers(updatedUsers);
      
      // Update in teacher_students data
      const teacherStudents = JSON.parse(localStorage.getItem('teacher_students') || '[]');
      const updatedTeacherStudents = teacherStudents.map((student: any) =>
        student.id === studentId 
          ? { 
              ...student, 
              status: 'approved' as const,
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : student
      );
      localStorage.setItem('teacher_students', JSON.stringify(updatedTeacherStudents));
      
      console.log('✅ Student approved successfully:', studentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error approving student:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Reject student
  static async rejectStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚫 Rejecting student:', studentId);
      
      // Update in main users data
      const users = this.getMockUsers();
      const updatedUsers = users.map(user => 
        user.id === studentId 
          ? { 
              ...user, 
              status: 'rejected' as const,
              rejected_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : user
      );
      this.saveMockUsers(updatedUsers);
      
      // Update in teacher_students data
      const teacherStudents = JSON.parse(localStorage.getItem('teacher_students') || '[]');
      const updatedTeacherStudents = teacherStudents.map((student: any) =>
        student.id === studentId 
          ? { 
              ...student, 
              status: 'rejected' as const,
              rejected_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : student
      );
      localStorage.setItem('teacher_students', JSON.stringify(updatedTeacherStudents));
      
      console.log('✅ Student rejected successfully:', studentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error rejecting student:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }
}