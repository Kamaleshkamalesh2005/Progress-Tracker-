import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuthService, User } from '@/services/auth';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  approved: boolean;
  department_id?: string;
  department_name?: string;
  university?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  university: string;
  teachers: Teacher[];
  teacherCount: number;
}

export interface TeacherData {
  teachers: Teacher[];
  departments: Department[];
  totalTeachers: number;
  approvedTeachers: number;
  pendingTeachers: number;
}

export const useSupabaseTeachers = () => {
  const queryClient = useQueryClient();
  
  // Query for teacher data using AuthService (mock data)
  const { data: teacherData, isLoading, error } = useQuery<TeacherData>({
    queryKey: ['supabase-teachers'],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching teachers from AuthService...');
        
        // Fetch all users from AuthService
        const allUsers = AuthService.getMockUsers();
        
        // Filter for teachers only
        const teacherUsers = allUsers.filter(user => user.role === 'TEACHER');
        
        console.log('📊 All users:', allUsers.length);
        console.log('👥 Teacher users found:', teacherUsers.length);
        console.log('👥 Teacher users:', teacherUsers);

        // Transform users to teachers with proper approval status
        const teachers: Teacher[] = teacherUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          approved: user.status === 'approved', // Use actual status from user data
          department_id: user.department_id || null,
          department_name: user.department || null, // Map 'department' field to 'department_name'
          university: user.college_name || null,
          created_at: user.created_at,
          updated_at: user.updated_at
        }));

        console.log('👥 Teachers processed:', teachers);

        // Group teachers by department using department name as key
        console.log('🔍 Starting department grouping...');
        const departmentMap = new Map<string, Department>();
        const unassignedTeachers: Teacher[] = [];

        teachers.forEach(teacher => {
          if (teacher.approved) {
            // Use department_name for grouping
            const deptName = teacher.department_name;
            
            console.log(`👤 Processing teacher: ${teacher.name}, department: "${deptName}"`);
            
            if (deptName && deptName.trim() !== '') {
              // Use department name as the key for grouping
              const deptKey = deptName.toLowerCase().replace(/\s+/g, '-');
              
              console.log(`🏢 Creating/updating department: ${deptName} (key: ${deptKey})`);
              
              if (!departmentMap.has(deptKey)) {
                departmentMap.set(deptKey, {
                  id: teacher.department_id || deptKey, // Use department_id if available, otherwise use deptKey
                  name: deptName,
                  university: teacher.university || 'Unknown University',
                  teachers: [],
                  teacherCount: 0
                });
                console.log(`✅ Created new department: ${deptName}`);
              }
              
              const department = departmentMap.get(deptKey)!;
              department.teachers.push(teacher);
              department.teacherCount = department.teachers.length;
              console.log(`➕ Added teacher ${teacher.name} to department ${deptName}`);
            } else {
              console.log(`❌ Teacher ${teacher.name} has no department, adding to unassigned`);
              unassignedTeachers.push(teacher);
            }
          } else {
            console.log(`⏳ Teacher ${teacher.name} is not approved, skipping`);
          }
        });

        // Add unassigned teachers as a separate department
        if (unassignedTeachers.length > 0) {
          departmentMap.set('unassigned', {
            id: 'unassigned',
            name: 'Unassigned',
            university: 'Various',
            teachers: unassignedTeachers,
            teacherCount: unassignedTeachers.length
          });
        }

        const departments = Array.from(departmentMap.values());
        const approvedTeachers = teachers.filter(t => t.approved);
        const pendingTeachers = teachers.filter(t => !t.approved);

        console.log('✅ Real Supabase teachers data loaded:', {
          total: teachers.length,
          approved: approvedTeachers.length,
          pending: pendingTeachers.length,
          departments: departments.length,
          unassigned: unassignedTeachers.length
        });

        return {
          teachers,
          departments,
          totalTeachers: teachers.length,
          approvedTeachers: approvedTeachers.length,
          pendingTeachers: pendingTeachers.length
        };

      } catch (error) {
        console.error('❌ Error fetching Supabase teachers:', error);
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

  // Real-time localStorage monitoring
  useEffect(() => {
    console.log('🔄 Setting up localStorage monitoring...');
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'code-nexus-mock-users') {
        console.log('📡 Mock users data changed:', e);
        queryClient.invalidateQueries({ queryKey: ['supabase-teachers'] });
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleCustomUpdate = () => {
      console.log('📡 Custom update event received');
      queryClient.invalidateQueries({ queryKey: ['supabase-teachers'] });
    };

    window.addEventListener('teacher-data-updated', handleCustomUpdate);

    return () => {
      console.log('🔄 Cleaning up localStorage monitoring...');
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('teacher-data-updated', handleCustomUpdate);
    };
  }, [queryClient]);

  // Function to update teacher details
  const updateTeacher = useCallback(async (teacherId: string, updates: Partial<Teacher>) => {
    try {
      console.log('🔄 Updating teacher in AuthService:', teacherId, updates);
      
      // Get all users and update the specific teacher
      const allUsers = AuthService.getMockUsers();
      const updatedUsers = allUsers.map(user => 
        user.id === teacherId 
          ? {
              ...user,
              name: updates.name || user.name,
              email: updates.email || user.email,
              department: updates.department_name || user.department,
              college_name: updates.university || user.college_name,
              status: updates.approved ? 'approved' : 'pending',
              updated_at: new Date().toISOString()
            }
          : user
      );

      // Save updated users back to localStorage
      localStorage.setItem('code-nexus-mock-users', JSON.stringify(updatedUsers));
      
      // Trigger custom event for real-time updates
      window.dispatchEvent(new CustomEvent('teacher-data-updated'));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating teacher:', error);
      return { success: false, error: 'Failed to update teacher' };
    }
  }, []);

  // Function to approve a teacher
  const approveTeacher = useCallback(async (teacherId: string) => {
    try {
      console.log('✅ Approving teacher in AuthService:', teacherId);
      
      // Get all users and update the specific teacher
      const allUsers = AuthService.getMockUsers();
      const updatedUsers = allUsers.map(user => 
        user.id === teacherId 
          ? { ...user, status: 'approved', updated_at: new Date().toISOString() }
          : user
      );

      // Save updated users back to localStorage
      localStorage.setItem('code-nexus-mock-users', JSON.stringify(updatedUsers));
      
      // Trigger custom event for real-time updates
      window.dispatchEvent(new CustomEvent('teacher-data-updated'));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error approving teacher:', error);
      return { success: false, error: 'Failed to approve teacher' };
    }
  }, []);

  // Function to reject a teacher
  const rejectTeacher = useCallback(async (teacherId: string) => {
    try {
      console.log('❌ Rejecting teacher in AuthService:', teacherId);
      
      // Get all users and update the specific teacher
      const allUsers = AuthService.getMockUsers();
      const updatedUsers = allUsers.map(user => 
        user.id === teacherId 
          ? { ...user, status: 'rejected', updated_at: new Date().toISOString() }
          : user
      );

      // Save updated users back to localStorage
      localStorage.setItem('code-nexus-mock-users', JSON.stringify(updatedUsers));
      
      // Trigger custom event for real-time updates
      window.dispatchEvent(new CustomEvent('teacher-data-updated'));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error rejecting teacher:', error);
      return { success: false, error: 'Failed to reject teacher' };
    }
  }, []);

  return {
    teacherData,
    isLoading,
    error,
    updateTeacher,
    approveTeacher,
    rejectTeacher
  };
};
