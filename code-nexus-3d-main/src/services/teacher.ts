// Teacher-specific services for managing student progress

import { PlatformStats } from './platforms';

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber?: string;
  role: 'STUDENT';
  status: 'pending' | 'approved' | 'rejected';
  platformStats: PlatformStats[];
  platformUsernames: {
    leetcode?: string;
    geeksforgeeks?: string;
    hackerrank?: string;
    codechef?: string;
    hackerearth?: string;
    codeforces?: string;
    atcoder?: string;
    topcoder?: string;
    cses?: string;
    interviewbit?: string;
  };
  totalProblemsSolved: number;
  easyProblemsSolved: number;
  mediumProblemsSolved: number;
  hardProblemsSolved: number;
  currentStreak: number;
  maxStreak: number;
  badgesEarned: number;
  lastActive: string;
  isInactive: boolean;
  inactiveDays: number;
  teacherId: string;
  createdAt: string;
}

export interface ClassStats {
  totalStudents: number;
  activeStudents: number;
  averageProblemsSolved: number;
  topPerformers: Student[];
  recentActivity: Array<{
    student: Student;
    action: string;
    platform: string;
    timestamp: string;
  }>;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  platform: 'LEETCODE' | 'GEEKSFORGEEKS' | 'HACKERRANK';
  problemIds: string[];
  dueDate: string;
  studentIds: string[];
  createdAt: string;
  teacherId: string;
}

export interface Class {
  id: string;
  name: string;
  description: string;
  subject: string;
  studentIds: string[];
  createdAt: string;
  teacherId: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'selected';
  studentIds?: string[];
  createdAt: string;
  isActive: boolean;
  teacherId: string;
}

export interface StudentAlert {
  id: string;
  studentId: string;
  teacherId: string;
  type: 'inactivity_warning' | 'reminder' | 'encouragement' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  sentAt?: string;
}

export class TeacherService {
  // Get all students for a teacher
  static async getStudents(teacherId: string): Promise<Student[]> {
    try {
      const students = JSON.parse(localStorage.getItem('teacher_students') || '[]');
      return students.filter((student: Student) => student.teacherId === teacherId);
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  // Get announcements for a teacher
  static async getAnnouncements(teacherId: string): Promise<Announcement[]> {
    try {
      const announcements = JSON.parse(localStorage.getItem('teacher_announcements') || '[]');
      return announcements.filter((announcement: Announcement) => announcement.teacherId === teacherId);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  }

  // Approve student
  static async approveStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const students = JSON.parse(localStorage.getItem('teacher_students') || '[]');
      const updatedStudents = students.map((student: Student) =>
        student.id === studentId ? { ...student, status: 'approved' as const } : student
      );
      localStorage.setItem('teacher_students', JSON.stringify(updatedStudents));
      return { success: true };
    } catch (error) {
      console.error('Error approving student:', error);
      return { success: false, error: 'Failed to approve student' };
    }
  }

  // Reject student
  static async rejectStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const students = JSON.parse(localStorage.getItem('teacher_students') || '[]');
      const updatedStudents = students.map((student: Student) =>
        student.id === studentId ? { ...student, status: 'rejected' as const } : student
      );
      localStorage.setItem('teacher_students', JSON.stringify(updatedStudents));
      return { success: true };
    } catch (error) {
      console.error('Error rejecting student:', error);
      return { success: false, error: 'Failed to reject student' };
    }
  }

  // Mark student as active
  static async markStudentActive(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const students = JSON.parse(localStorage.getItem('teacher_students') || '[]');
      const updatedStudents = students.map((student: Student) =>
        student.id === studentId ? { ...student, isInactive: false, inactiveDays: 0 } : student
      );
      localStorage.setItem('teacher_students', JSON.stringify(updatedStudents));
      return { success: true };
    } catch (error) {
      console.error('Error marking student active:', error);
      return { success: false, error: 'Failed to mark student active' };
    }
  }

  // Create announcement
  static async createAnnouncement(teacherId: string, announcement: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    targetAudience: 'all' | 'selected';
    studentIds?: string[];
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...announcement,
        createdAt: new Date().toISOString(),
        isActive: true,
        teacherId
      };

      const existingAnnouncements = JSON.parse(localStorage.getItem('teacher_announcements') || '[]');
      const updatedAnnouncements = [...existingAnnouncements, newAnnouncement];
      localStorage.setItem('teacher_announcements', JSON.stringify(updatedAnnouncements));
      
      console.log('Announcement created:', newAnnouncement);
      return { success: true };
    } catch (error) {
      console.error('Error creating announcement:', error);
      return { success: false, error: 'Failed to create announcement' };
    }
  }

  // Get student alerts for a teacher
  static async getStudentAlerts(teacherId: string): Promise<StudentAlert[]> {
    try {
      const alerts = JSON.parse(localStorage.getItem('teacher_student_alerts') || '[]');
      return alerts.filter((alert: StudentAlert) => alert.teacherId === teacherId);
    } catch (error) {
      console.error('Error fetching student alerts:', error);
      return [];
    }
  }

  // Send alert to student
  static async sendStudentAlert(teacherId: string, alert: {
    studentId: string;
    type: 'inactivity_warning' | 'reminder' | 'encouragement' | 'general';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const newAlert: StudentAlert = {
        id: Date.now().toString(),
        ...alert,
        teacherId,
        isRead: false,
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString()
      };

      const existingAlerts = JSON.parse(localStorage.getItem('teacher_student_alerts') || '[]');
      const updatedAlerts = [...existingAlerts, newAlert];
      localStorage.setItem('teacher_student_alerts', JSON.stringify(updatedAlerts));
      
      console.log('Student alert sent:', newAlert);
      return { success: true };
    } catch (error) {
      console.error('Error sending student alert:', error);
      return { success: false, error: 'Failed to send alert' };
    }
  }

  // Send bulk alerts to inactive students
  static async sendBulkInactivityAlerts(teacherId: string, inactiveStudentIds: string[]): Promise<{ success: boolean; error?: string; sentCount: number }> {
    try {
      const alerts = inactiveStudentIds.map(studentId => ({
        id: Date.now().toString() + Math.random(),
        studentId,
        teacherId,
        type: 'inactivity_warning' as const,
        title: 'Inactivity Warning',
        message: 'You haven\'t been active on coding platforms recently. Please resume your practice to maintain your progress.',
        priority: 'medium' as const,
        isRead: false,
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString()
      }));

      const existingAlerts = JSON.parse(localStorage.getItem('teacher_student_alerts') || '[]');
      const updatedAlerts = [...existingAlerts, ...alerts];
      localStorage.setItem('teacher_student_alerts', JSON.stringify(updatedAlerts));
      
      console.log('Bulk inactivity alerts sent:', alerts.length);
      return { success: true, sentCount: alerts.length };
    } catch (error) {
      console.error('Error sending bulk inactivity alerts:', error);
      return { success: false, error: 'Failed to send bulk alerts', sentCount: 0 };
    }
  }

  // Export student data
  static async exportStudentData(teacherId: string, platform?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const students = await this.getStudents(teacherId);
      
      let filteredStudents = students;
      if (platform) {
        filteredStudents = students.filter(student => 
          student.platformUsernames[platform.toLowerCase() as keyof typeof student.platformUsernames]
        );
      }

      const exportData = filteredStudents.map(student => ({
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber || '',
        status: student.status,
        totalProblemsSolved: student.totalProblemsSolved,
        easyProblemsSolved: student.easyProblemsSolved || 0,
        mediumProblemsSolved: student.mediumProblemsSolved || 0,
        hardProblemsSolved: student.hardProblemsSolved || 0,
        currentStreak: student.currentStreak,
        maxStreak: student.maxStreak,
        badgesEarned: student.badgesEarned,
        lastActive: student.lastActive,
        isInactive: student.isInactive,
        inactiveDays: student.inactiveDays,
        platformUsernames: student.platformUsernames,
        createdAt: student.createdAt
      }));

      return { success: true, data: exportData };
    } catch (error) {
      console.error('Error exporting student data:', error);
      return { success: false, error: 'Failed to export student data' };
    }
  }

  // Get class statistics
  static async getClassStats(teacherId: string): Promise<ClassStats> {
    try {
      const students = await this.getStudents(teacherId);
      
      const totalStudents = students.length;
      const activeStudents = students.filter(s => {
        const lastActive = new Date(s.lastActive);
        const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
        return hoursSinceActive <= 24; // Active if last seen within 24 hours
      }).length;

      const averageProblemsSolved = students.length > 0 
        ? Math.round(students.reduce((sum, s) => sum + s.totalProblemsSolved, 0) / students.length)
        : 0;

      const topPerformers = students
        .sort((a, b) => b.totalProblemsSolved - a.totalProblemsSolved)
        .slice(0, 5);

      const recentActivity: Array<{
        student: Student;
        action: string;
        platform: string;
        timestamp: string;
      }> = [];

      return {
        totalStudents,
        activeStudents,
        averageProblemsSolved,
        topPerformers,
        recentActivity,
      };
    } catch (error) {
      console.error('Error fetching class stats:', error);
      return {
        totalStudents: 0,
        activeStudents: 0,
        averageProblemsSolved: 0,
        topPerformers: [],
        recentActivity: [],
      };
    }
  }

  // Get student progress over time
  static async getStudentProgress(studentId: string): Promise<Array<{
    date: string;
    problemsSolved: number;
    streak: number;
  }>> {
    try {
      // In production, this would fetch historical data
      // For now, return empty array - no fake data
      console.log('Fetching progress for student:', studentId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return [];
    } catch (error) {
      console.error('Error fetching student progress:', error);
      return [];
    }
  }

  // Get assignments for a teacher
  static async getAssignments(teacherId: string): Promise<Assignment[]> {
    try {
      const assignments = JSON.parse(localStorage.getItem('teacher_assignments') || '[]');
      return assignments.filter((assignment: Assignment) => assignment.teacherId === teacherId);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  // Get classes for a teacher
  static async getClasses(teacherId: string): Promise<Class[]> {
    try {
      const classes = JSON.parse(localStorage.getItem('teacher_classes') || '[]');
      return classes.filter((cls: Class) => cls.teacherId === teacherId);
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  }

  // Create assignment
  static async createAssignment(teacherId: string, assignment: {
    title: string;
    description: string;
    platform: 'LEETCODE' | 'GEEKSFORGEEKS' | 'HACKERRANK';
    problemIds: string[];
    dueDate: string;
    studentIds: string[];
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const newAssignment: Assignment = {
        id: Date.now().toString(),
        ...assignment,
        createdAt: new Date().toISOString(),
        teacherId
      };

      const existingAssignments = JSON.parse(localStorage.getItem('teacher_assignments') || '[]');
      const updatedAssignments = [...existingAssignments, newAssignment];
      localStorage.setItem('teacher_assignments', JSON.stringify(updatedAssignments));
      
      console.log('Assignment created:', newAssignment);
      return { success: true };
    } catch (error) {
      console.error('Error creating assignment:', error);
      return { success: false, error: 'Failed to create assignment' };
    }
  }

  // Create class
  static async createClass(teacherId: string, classData: {
    name: string;
    description: string;
    subject: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const newClass: Class = {
        id: Date.now().toString(),
        ...classData,
        studentIds: [],
        createdAt: new Date().toISOString(),
        teacherId
      };

      const existingClasses = JSON.parse(localStorage.getItem('teacher_classes') || '[]');
      const updatedClasses = [...existingClasses, newClass];
      localStorage.setItem('teacher_classes', JSON.stringify(updatedClasses));
      
      console.log('Class created:', newClass);
      return { success: true };
    } catch (error) {
      console.error('Error creating class:', error);
      return { success: false, error: 'Failed to create class' };
    }
  }
}



