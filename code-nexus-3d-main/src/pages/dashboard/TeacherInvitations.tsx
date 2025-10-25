import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  Mail, 
  Copy, 
  CheckCircle, 
  Clock, 
  XCircle,
  Send,
  UserPlus,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { DatabaseService, TeacherInvitation } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

export default function TeacherInvitations() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invitations, setInvitations] = useState<TeacherInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    studentEmail: '',
    message: ''
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (userRole && userRole !== 'TEACHER') {
        switch (userRole) {
          case 'ADMIN':
            navigate('/dashboard/admin');
            break;
          case 'STUDENT':
            navigate('/dashboard/student');
            break;
          default:
            navigate('/');
        }
      } else {
        loadInvitations();
      }
    }
  }, [user, userRole, loading, navigate]);

  const loadInvitations = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, you would fetch invitations from the database
      // For now, we'll use mock data to demonstrate the functionality
      const mockInvitations: TeacherInvitation[] = [
        {
          id: '1',
          teacher_id: user.id,
          student_email: 'student1@example.com',
          invitation_code: 'ABC123',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_used: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          teacher_id: user.id,
          student_email: 'student2@example.com',
          invitation_code: 'DEF456',
          expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          is_used: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setInvitations(mockInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Error loading invitations",
        description: "Failed to load invitations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInvitation = async () => {
    if (!user?.id || !newInvitation.studentEmail) return;

    try {
      const result = await DatabaseService.createTeacherInvitation(
        user.id,
        newInvitation.studentEmail
      );

      if (result.success && result.invitationCode) {
        toast({
          title: "Invitation created",
          description: `Invitation sent to ${newInvitation.studentEmail}`,
        });
        
        // Reset form and reload invitations
        setNewInvitation({ studentEmail: '', message: '' });
        setIsAddDialogOpen(false);
        await loadInvitations();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Invitation failed",
        description: "Failed to create invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyInvitationCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Copied to clipboard",
        description: "Invitation code copied successfully.",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const sendInvitationEmail = (invitation: TeacherInvitation) => {
    // In a real implementation, this would send an actual email
    const invitationLink = `${window.location.origin}/auth?invite=${invitation.invitation_code}`;
    const emailBody = `
Hello!

You have been invited to join Code Nexus by your teacher.

Click the link below to create your account:
${invitationLink}

Invitation Code: ${invitation.invitation_code}

This invitation expires on ${new Date(invitation.expires_at).toLocaleDateString()}.

Best regards,
Code Nexus Team
    `;
    
    const mailtoLink = `mailto:${invitation.student_email}?subject=Invitation to Code Nexus&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || userRole !== 'TEACHER') {
    return null;
  }

  const activeInvitations = invitations.filter(inv => !inv.is_used && new Date(inv.expires_at) > new Date());
  const usedInvitations = invitations.filter(inv => inv.is_used);
  const expiredInvitations = invitations.filter(inv => !inv.is_used && new Date(inv.expires_at) <= new Date());

  return (
    <DashboardLayout title="Student Invitations">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeInvitations.length}</p>
                  <p className="text-sm text-muted-foreground">Active Invitations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{usedInvitations.length}</p>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{expiredInvitations.length}</p>
                  <p className="text-sm text-muted-foreground">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Invitation */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Invite Students
                </CardTitle>
                <CardDescription>Send invitation codes to students to join your class</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-secondary">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Student</DialogTitle>
                    <DialogDescription>
                      Send an invitation to a student to join your class
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Student Email</label>
                      <Input
                        type="email"
                        value={newInvitation.studentEmail}
                        onChange={(e) => setNewInvitation({...newInvitation, studentEmail: e.target.value})}
                        placeholder="student@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Personal Message (Optional)</label>
                      <Textarea
                        value={newInvitation.message}
                        onChange={(e) => setNewInvitation({...newInvitation, message: e.target.value})}
                        placeholder="Add a personal message to the invitation..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createInvitation}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invitation
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* Active Invitations */}
        {activeInvitations.length > 0 && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Active Invitations
              </CardTitle>
              <CardDescription>Invitations waiting for student response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeInvitations.map((invitation, index) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-primary/10 hover:border-primary/30 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <Mail className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{invitation.student_email}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Created: {new Date(invitation.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-sm">
                                {invitation.invitation_code}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyInvitationCode(invitation.invitation_code)}
                              >
                                {copiedCode === invitation.invitation_code ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendInvitationEmail(invitation)}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Email
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Used Invitations */}
        {usedInvitations.length > 0 && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Accepted Invitations
              </CardTitle>
              <CardDescription>Students who have joined your class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usedInvitations.map((invitation, index) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-green-200 bg-green-50/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{invitation.student_email}</h3>
                            <p className="text-sm text-muted-foreground">
                              Joined on {new Date(invitation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expired Invitations */}
        {expiredInvitations.length > 0 && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Expired Invitations
              </CardTitle>
              <CardDescription>Invitations that have expired</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expiredInvitations.map((invitation, index) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-red-200 bg-red-50/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{invitation.student_email}</h3>
                            <p className="text-sm text-muted-foreground">
                              Expired on {new Date(invitation.expires_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {invitations.length === 0 && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invitations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by inviting students to join your class
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Your First Student
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}



