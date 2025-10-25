import { useState, useEffect, useCallback } from 'react';
import { TeacherService, Student, ClassStats, Assignment, Class, Announcement, StudentAlert } from '@/services/teacher';
import { useAuth } from '@/hooks/useAuth';

export interface UseTeacherDataReturn {
  students: Student[];
  classStats: ClassStats | null;
  assignments: Assignment[];
  classes: Class[];
  announcements: Announcement[];
  studentAlerts: StudentAlert[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createAssignment: (assignment: {
    title: string;
    description: string;
    platform: 'LEETCODE' | 'GEEKSFORGEEKS' | 'HACKERRANK';
    problemIds: string[];
    dueDate: string;
    studentIds: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  createClass: (classData: {
    name: string;
    description: string;
    subject: string;
  }) => Promise<{ success: boolean; error?: string }>;
  approveStudent: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  rejectStudent: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  markStudentActive: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  createAnnouncement: (announcement: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    targetAudience: 'all' | 'selected';
    studentIds?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  sendStudentAlert: (alert: {
    studentId: string;
    type: 'inactivity_warning' | 'reminder' | 'encouragement' | 'general';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }) => Promise<{ success: boolean; error?: string }>;
  sendBulkInactivityAlerts: (inactiveStudentIds: string[]) => Promise<{ success: boolean; error?: string; sentCount: number }>;
  exportStudentData: (platform?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export function useTeacherData(): UseTeacherDataReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentAlerts, setStudentAlerts] = useState<StudentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTeacherData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [studentsData, statsData, assignmentsData, classesData, announcementsData, alertsData] = await Promise.all([
        TeacherService.getStudents(user.id),
        TeacherService.getClassStats(user.id),
        TeacherService.getAssignments(user.id),
        TeacherService.getClasses(user.id),
        TeacherService.getAnnouncements(user.id),
        TeacherService.getStudentAlerts(user.id),
      ]);
      
      setStudents(studentsData);
      setClassStats(statsData);
      setAssignments(assignmentsData);
      setClasses(classesData);
      setAnnouncements(announcementsData);
      setStudentAlerts(alertsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teacher data');
      console.error('Error fetching teacher data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshData = useCallback(async () => {
    await fetchTeacherData();
  }, [fetchTeacherData]);

  const createAssignment = useCallback(async (assignment: {
    title: string;
    description: string;
    platform: 'LEETCODE' | 'GEEKSFORGEEKS' | 'HACKERRANK';
    problemIds: string[];
    dueDate: string;
    studentIds: string[];
  }) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await TeacherService.createAssignment(user.id, assignment);
      if (result.success) {
        // Refresh data after creating assignment
        await fetchTeacherData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create assignment';
      return { success: false, error: errorMessage };
    }
  }, [user?.id, fetchTeacherData]);

  const createClass = useCallback(async (classData: {
    name: string;
    description: string;
    subject: string;
  }) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await TeacherService.createClass(user.id, classData);
      if (result.success) {
        // Refresh data after creating class
        await fetchTeacherData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create class';
      return { success: false, error: errorMessage };
    }
  }, [user?.id, fetchTeacherData]);

  const approveStudent = useCallback(async (studentId: string) => {
    try {
      const result = await TeacherService.approveStudent(studentId);
      if (result.success) {
        await fetchTeacherData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve student';
      return { success: false, error: errorMessage };
    }
  }, [fetchTeacherData]);

  const rejectStudent = useCallback(async (studentId: string) => {
    try {
      const result = await TeacherService.rejectStudent(studentId);
      if (result.success) {
        await fetchTeacherData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject student';
      return { success: false, error: errorMessage };
    }
  }, [fetchTeacherData]);

  const markStudentActive = useCallback(async (studentId: string) => {
    try {
      const result = await TeacherService.markStudentActive(studentId);
      if (result.success) {
        await fetchTeacherData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark student active';
      return { success: false, error: errorMessage };
    }
  }, [fetchTeacherData]);

  const createAnnouncement = useCallback(async (announcement: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    targetAudience: 'all' | 'selected';
    studentIds?: string[];
  }) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await TeacherService.createAnnouncement(user.id, announcement);
      if (result.success) {
        await fetchTeacherData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create announcement';
      return { success: false, error: errorMessage };
    }
  }, [user?.id, fetchTeacherData]);

  const sendStudentAlert = useCallback(async (alert: {
    studentId: string;
    type: 'inactivity_warning' | 'reminder' | 'encouragement' | 'general';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await TeacherService.sendStudentAlert(user.id, alert);
      if (result.success) {
        await fetchTeacherData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send alert';
      return { success: false, error: errorMessage };
    }
  }, [user?.id, fetchTeacherData]);

  const sendBulkInactivityAlerts = useCallback(async (inactiveStudentIds: string[]) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated', sentCount: 0 };
    }

    try {
      const result = await TeacherService.sendBulkInactivityAlerts(user.id, inactiveStudentIds);
      if (result.success) {
        await fetchTeacherData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send bulk alerts';
      return { success: false, error: errorMessage, sentCount: 0 };
    }
  }, [user?.id, fetchTeacherData]);

  const exportStudentData = useCallback(async (platform?: string) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await TeacherService.exportStudentData(user.id, platform);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export student data';
      return { success: false, error: errorMessage };
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchTeacherData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchTeacherData, user?.id]);

  return {
    students,
    classStats,
    assignments,
    classes,
    announcements,
    studentAlerts,
    loading,
    error,
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
  };
}
