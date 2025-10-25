// Database service for managing student platform connections and real data

import { supabase } from '@/integrations/supabase/client';
import { PlatformProfile } from './realPlatforms';

export interface StudentPlatformConnection {
  id: string;
  user_id: string;
  platform: 'LEETCODE' | 'GEEKSFORGEEKS' | 'HACKERRANK' | 'CODECHEF' | 'CODEFORCES' | 'ATCODER';
  username: string;
  is_verified: boolean;
  last_synced: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  platform_connections: StudentPlatformConnection[];
  total_problems_solved: number;
  current_streak: number;
  max_streak: number;
  total_badges: number;
  last_updated: string;
}

export interface TeacherInvitation {
  id: string;
  teacher_id: string;
  student_email: string;
  invitation_code: string;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

export class DatabaseService {
  // Student Platform Connections
  static async addPlatformConnection(
    userId: string, 
    platform: string, 
    username: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('student_platform_connections')
        .insert({
          user_id: userId,
          platform: platform.toUpperCase(),
          username: username,
          is_verified: false,
          last_synced: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error adding platform connection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async getStudentPlatformConnections(userId: string): Promise<StudentPlatformConnection[]> {
    try {
      const { data, error } = await supabase
        .from('student_platform_connections')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching platform connections:', error);
      return [];
    }
  }

  static async updatePlatformConnection(
    connectionId: string, 
    updates: Partial<StudentPlatformConnection>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('student_platform_connections')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating platform connection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async removePlatformConnection(connectionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('student_platform_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error removing platform connection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Student Profiles
  static async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          *,
          platform_connections:student_platform_connections(*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }
  }

  static async updateStudentProfile(
    userId: string, 
    updates: Partial<StudentProfile>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('student_profiles')
        .update({
          ...updates,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating student profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Teacher Invitations
  static async createTeacherInvitation(
    teacherId: string, 
    studentEmail: string
  ): Promise<{ success: boolean; invitationCode?: string; error?: string }> {
    try {
      const invitationCode = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data, error } = await supabase
        .from('teacher_invitations')
        .insert({
          teacher_id: teacherId,
          student_email: studentEmail,
          invitation_code: invitationCode,
          expires_at: expiresAt.toISOString(),
          is_used: false
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, invitationCode };
    } catch (error) {
      console.error('Error creating teacher invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async validateInvitationCode(invitationCode: string): Promise<{ 
    success: boolean; 
    teacherId?: string; 
    studentEmail?: string; 
    error?: string 
  }> {
    try {
      const { data, error } = await supabase
        .from('teacher_invitations')
        .select('*')
        .eq('invitation_code', invitationCode)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;
      
      if (!data) {
        return { success: false, error: 'Invalid or expired invitation code' };
      }

      return { 
        success: true, 
        teacherId: data.teacher_id, 
        studentEmail: data.student_email 
      };
    } catch (error) {
      console.error('Error validating invitation code:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async markInvitationAsUsed(invitationCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('teacher_invitations')
        .update({ is_used: true })
        .eq('invitation_code', invitationCode);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error marking invitation as used:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Teacher Student Management
  static async getTeacherStudents(teacherId: string): Promise<StudentProfile[]> {
    try {
      const { data, error } = await supabase
        .from('teacher_students')
        .select(`
          student_profiles:student_profiles(
            *,
            platform_connections:student_platform_connections(*)
          )
        `)
        .eq('teacher_id', teacherId);

      if (error) throw error;
      return data?.map(item => item.student_profiles).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching teacher students:', error);
      return [];
    }
  }

  static async addStudentToTeacher(teacherId: string, studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('teacher_students')
        .insert({
          teacher_id: teacherId,
          student_id: studentId
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error adding student to teacher:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Platform Data Storage
  static async storePlatformData(
    userId: string, 
    platformData: PlatformProfile
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('platform_data')
        .upsert({
          user_id: userId,
          platform: platformData.platform,
          username: platformData.username,
          problems_solved: platformData.problemsSolved,
          easy_solved: platformData.easySolved,
          medium_solved: platformData.mediumSolved,
          hard_solved: platformData.hardSolved,
          current_streak: platformData.currentStreak,
          max_streak: platformData.maxStreak,
          rank: platformData.rank,
          rating: platformData.rating,
          badges: platformData.badges,
          last_synced: platformData.lastSynced,
          is_valid: platformData.isValid,
          error_message: platformData.error
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error storing platform data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async getPlatformData(userId: string): Promise<PlatformProfile[]> {
    try {
      const { data, error } = await supabase
        .from('platform_data')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      return (data || []).map(item => ({
        platform: item.platform,
        username: item.username,
        problemsSolved: item.problems_solved,
        easySolved: item.easy_solved,
        mediumSolved: item.medium_solved,
        hardSolved: item.hard_solved,
        currentStreak: item.current_streak,
        maxStreak: item.max_streak,
        rank: item.rank,
        rating: item.rating,
        badges: item.badges || [],
        lastSynced: item.last_synced,
        isValid: item.is_valid,
        error: item.error_message
      }));
    } catch (error) {
      console.error('Error fetching platform data:', error);
      return [];
    }
  }
}



