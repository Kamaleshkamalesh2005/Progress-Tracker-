import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoginScene } from '@/components/three/LoginScene';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Mail } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [section, setSection] = useState('');
  const [year, setYear] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeAddress, setCollegeAddress] = useState('');
  const [collegeContact, setCollegeContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Department list
  const departments = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biotechnology',
    'Data Science',
    'Artificial Intelligence',
    'Cybersecurity',
    'Software Engineering',
    'Computer Applications',
    'Business Administration',
    'Commerce',
    'Economics',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English Literature',
    'History',
    'Psychology',
    'Sociology'
  ];

  // Generate sections A to Z
  const sections = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  // Generate years 1st to 5th
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];


  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      console.log('User authenticated, redirecting...', { user: user.id, role: userRole });
      
      if (userRole) {
        switch (userRole) {
          case 'STUDENT':
            navigate('/dashboard/student');
            break;
          case 'TEACHER':
            navigate('/dashboard/teacher');
            break;
          case 'ADMIN':
            navigate('/dashboard/admin');
            break;
          case 'SUPER_ADMIN':
            navigate('/dashboard/superadmin');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [user, userRole, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.success) {
          toast({
            title: "Successfully signed in",
            description: "Welcome back!",
          });
        } else {
          setError(result.error || 'Sign in failed');
        }
      } else {
        // Validate role-specific fields
        if (role === 'STUDENT' && (!rollNumber || !department || !section || !year || !collegeName)) {
          setError('Please fill in roll number, department, section, year, and college name for student registration');
          return;
        }
        if (role === 'TEACHER' && (!collegeName || !department)) {
          setError('Please fill in college name and department for teacher registration');
          return;
        }
        if (role === 'ADMIN' && (!collegeName || !collegeAddress || !collegeContact)) {
          setError('Please fill in college name, address, and contact information for admin registration');
          return;
        }

        const result = await signUp(email, password, name, role, {
          rollNumber: role === 'STUDENT' ? rollNumber : undefined,
          department: role === 'STUDENT' ? department : (role === 'TEACHER' ? department : undefined),
          section: role === 'STUDENT' ? section : undefined,
          year: role === 'STUDENT' ? year : undefined,
          college_name: role === 'ADMIN' ? collegeName : (role === 'TEACHER' ? collegeName : (role === 'STUDENT' ? collegeName : undefined)),
          college_id: role === 'ADMIN' ? `college_${Date.now()}` : (role === 'TEACHER' ? `teacher_college_${Date.now()}` : (role === 'STUDENT' ? `student_college_${Date.now()}` : undefined))
        });
        if (result.success) {
          if (role === 'STUDENT') {
            toast({
              title: "Registration submitted successfully",
              description: "Your registration has been sent to your college's assigned teacher for approval.",
            });
          } else if (role === 'ADMIN' || role === 'TEACHER') {
            toast({
              title: "Registration submitted successfully",
              description: `Your ${role.toLowerCase()} account is pending approval. You'll be notified once approved.`,
            });
          } else {
            toast({
              title: "Account created successfully",
              description: "Welcome to Progress Tracker!",
            });
          }
        } else {
          setError(result.error || 'Sign up failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <LoginScene />
      </div>

      {/* Auth Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-auto p-6"
      >
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {isLogin ? 'Welcome Back' : 'Join Progress Tracker'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isLogin && role === 'STUDENT' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="Enter your roll number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Select value={section} onValueChange={setSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((sec) => (
                          <SelectItem key={sec} value={sec}>
                            Section {sec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((yr) => (
                          <SelectItem key={yr} value={yr}>
                            {yr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentCollegeName">College Name *</Label>
                    <Input
                      id="studentCollegeName"
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="Enter your college name"
                      required
                    />
                  </div>
                </>
              )}

              {!isLogin && role === 'TEACHER' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input
                      id="collegeName"
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="Type your college name..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherDepartment">Department</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {!isLogin && role === 'ADMIN' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input
                      id="collegeName"
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="Enter college name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collegeAddress">College Address</Label>
                    <Textarea
                      id="collegeAddress"
                      value={collegeAddress}
                      onChange={(e) => setCollegeAddress(e.target.value)}
                      placeholder="Enter college address"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collegeContact">Contact Information</Label>
                    <Input
                      id="collegeContact"
                      type="text"
                      value={collegeContact}
                      onChange={(e) => setCollegeContact(e.target.value)}
                      placeholder="Enter contact information"
                      required
                    />
                  </div>
                </>
              )}


              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Button
                  variant="link"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="p-0 h-auto text-primary hover:text-primary/80"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}