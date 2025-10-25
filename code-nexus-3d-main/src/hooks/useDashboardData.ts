import { useState, useEffect, useCallback } from 'react';
import DashboardDataService, { DashboardData } from '@/services/dashboardData';

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(DashboardDataService.getInstance().getData());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const listenerId = `dashboard-listener-${Date.now()}`;
    
    // Subscribe to data changes
    DashboardDataService.getInstance().subscribe(listenerId, (newData) => {
      setData(newData);
      setLoading(false);
    });

    // Initialize with sample data if empty
    if (data.users.length === 0) {
      DashboardDataService.getInstance().initializeSampleData();
    }

    setLoading(false);

    // Cleanup subscription
    return () => {
      DashboardDataService.getInstance().unsubscribe(listenerId);
    };
  }, []);

  // User management methods
  const addUser = useCallback((user: any) => {
    DashboardDataService.getInstance().addUser(user);
  }, []);

  const updateUser = useCallback((userId: string, updates: any) => {
    DashboardDataService.getInstance().updateUser(userId, updates);
  }, []);

  const approveUser = useCallback((userId: string, approvedBy: string) => {
    DashboardDataService.getInstance().approveUser(userId, approvedBy);
  }, []);

  const rejectUser = useCallback((userId: string, rejectedBy: string) => {
    DashboardDataService.getInstance().rejectUser(userId, rejectedBy);
  }, []);

  // Student progress methods
  const updateStudentProgress = useCallback((progress: any) => {
    DashboardDataService.getInstance().updateStudentProgress(progress);
  }, []);

  // Platform connection methods
  const addPlatformConnection = useCallback((connection: any) => {
    DashboardDataService.getInstance().addPlatformConnection(connection);
  }, []);

  const updatePlatformConnection = useCallback((connectionId: string, updates: any) => {
    DashboardDataService.getInstance().updatePlatformConnection(connectionId, updates);
  }, []);

  // Announcement methods
  const addAnnouncement = useCallback((announcement: any) => {
    DashboardDataService.getInstance().addAnnouncement(announcement);
  }, []);

  const updateAnnouncement = useCallback((announcementId: string, updates: any) => {
    DashboardDataService.getInstance().updateAnnouncement(announcementId, updates);
  }, []);

  // Notification methods
  const createNotification = useCallback((
    userId: string,
    title: string,
    message: string,
    type: 'approval' | 'announcement' | 'progress' | 'system',
    priority: 'low' | 'medium' | 'high' = 'medium',
    actionRequired: boolean = false
  ) => {
    DashboardDataService.getInstance().createNotification(userId, title, message, type, priority, actionRequired);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    DashboardDataService.getInstance().markNotificationAsRead(notificationId);
  }, []);

  // Get filtered data for specific role
  const getDataForRole = useCallback((role: string) => {
    return DashboardDataService.getInstance().getDataForRole(role);
  }, []);

  return {
    data,
    loading,
    addUser,
    updateUser,
    approveUser,
    rejectUser,
    updateStudentProgress,
    addPlatformConnection,
    updatePlatformConnection,
    addAnnouncement,
    updateAnnouncement,
    createNotification,
    markNotificationAsRead,
    getDataForRole
  };
}

