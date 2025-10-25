import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService, User } from '@/services/auth';

export interface DepartmentWithTeachers {
  id: string;
  name: string;
  university: string;
  head?: string;
  teachers: User[];
  teacherCount: number;
}

export interface TeacherData {
  teachers: User[];
  departments: DepartmentWithTeachers[];
  totalTeachers: number;
  approvedTeachers: number;
  pendingTeachers: number;
}

// Custom event for real-time updates
const TEACHER_UPDATE_EVENT = 'teacher-data-updated';

export const useRealTimeTeachers = () => {
  const queryClient = useQueryClient();
  
  // Query for teacher data
  const { data: teacherData, isLoading, error } = useQuery<TeacherData>({
    queryKey: ['teachers', 'real-time'],
    queryFn: async () => {
      try {
        const allUsers = AuthService.getMockUsers();
        const teachers = allUsers.filter(user => 
          user.role === 'TEACHER'
        );
        
        const approvedTeachers = teachers.filter(teacher => teacher.status === 'approved');
        const pendingTeachers = teachers.filter(teacher => teacher.status === 'pending');
        
        // Group teachers by department
        const departmentMap = new Map<string, DepartmentWithTeachers>();
        
        approvedTeachers.forEach(teacher => {
          const departmentName = teacher.department || 'Unassigned';
          const university = teacher.college_name || 'Unknown University';
          
          if (!departmentMap.has(departmentName)) {
            departmentMap.set(departmentName, {
              id: `dept_${departmentName.toLowerCase().replace(/\s+/g, '_')}`,
              name: departmentName,
              university,
              head: undefined,
              teachers: [],
              teacherCount: 0
            });
          }
          
          const department = departmentMap.get(departmentName)!;
          department.teachers.push(teacher);
          department.teacherCount = department.teachers.length;
        });
        
        const departments = Array.from(departmentMap.values());
        
        return {
          teachers,
          departments,
          totalTeachers: teachers.length,
          approvedTeachers: approvedTeachers.length,
          pendingTeachers: pendingTeachers.length
        };
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        return {
          teachers: [],
          departments: [],
          totalTeachers: 0,
          approvedTeachers: 0,
          pendingTeachers: 0
        };
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Function to trigger real-time update
  const triggerUpdate = useCallback(() => {
    try {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'real-time'] });
      window.dispatchEvent(new CustomEvent(TEACHER_UPDATE_EVENT));
    } catch (error) {
      console.error('Error triggering update:', error);
    }
  }, [queryClient]);

  // Listen for teacher updates
  useEffect(() => {
    const handleTeacherUpdate = () => {
      triggerUpdate();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'code-nexus-mock-users') {
        triggerUpdate();
      }
    };
    
    try {
      window.addEventListener(TEACHER_UPDATE_EVENT, handleTeacherUpdate);
      window.addEventListener('storage', handleStorageChange);
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }

    return () => {
      try {
        window.removeEventListener(TEACHER_UPDATE_EVENT, handleTeacherUpdate);
        window.removeEventListener('storage', handleStorageChange);
      } catch (error) {
        console.error('Error removing event listeners:', error);
      }
    };
  }, [triggerUpdate]);

  // Function to approve a teacher
  const approveTeacher = useCallback(async (teacherId: string) => {
    try {
      const allUsers = AuthService.getMockUsers();
      const updatedUsers = allUsers.map(user => 
        user.id === teacherId 
          ? { ...user, status: 'approved', updated_at: new Date().toISOString() }
          : user
      );
      
      localStorage.setItem('code-nexus-mock-users', JSON.stringify(updatedUsers));
      triggerUpdate();
      
      return { success: true };
    } catch (error) {
      console.error('Error approving teacher:', error);
      return { success: false, error: 'Failed to approve teacher' };
    }
  }, [triggerUpdate]);

  // Function to reject a teacher
  const rejectTeacher = useCallback(async (teacherId: string) => {
    try {
      const allUsers = AuthService.getMockUsers();
      const updatedUsers = allUsers.map(user => 
        user.id === teacherId 
          ? { ...user, status: 'rejected', updated_at: new Date().toISOString() }
          : user
      );
      
      localStorage.setItem('code-nexus-mock-users', JSON.stringify(updatedUsers));
      triggerUpdate();
      
      return { success: true };
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      return { success: false, error: 'Failed to reject teacher' };
    }
  }, [triggerUpdate]);

  // Function to update teacher details
  const updateTeacher = useCallback(async (teacherId: string, updates: Partial<User>) => {
    try {
      const allUsers = AuthService.getMockUsers();
      const updatedUsers = allUsers.map(user => 
        user.id === teacherId 
          ? { ...user, ...updates, updated_at: new Date().toISOString() }
          : user
      );
      
      localStorage.setItem('code-nexus-mock-users', JSON.stringify(updatedUsers));
      triggerUpdate();
      
      return { success: true };
    } catch (error) {
      console.error('Error updating teacher:', error);
      return { success: false, error: 'Failed to update teacher' };
    }
  }, [triggerUpdate]);

  return {
    teacherData,
    isLoading,
    error,
    approveTeacher,
    rejectTeacher,
    updateTeacher,
    triggerUpdate
  };
};

// Export the event name for external use
export { TEACHER_UPDATE_EVENT };