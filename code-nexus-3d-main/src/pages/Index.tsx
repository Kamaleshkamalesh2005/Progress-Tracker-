import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Rocket, 
  Trophy, 
  Target, 
  Calendar, 
  Github, 
  BarChart3, 
  Users, 
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Zap
} from 'lucide-react';

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && userRole) {
      switch (userRole) {
        case 'ADMIN':
          navigate('/dashboard/admin');
          break;
        case 'TEACHER':
          navigate('/dashboard/teacher');
          break;
        case 'STUDENT':
          navigate('/dashboard/student');
          break;
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="mb-8 flex justify-center">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-glow shadow-2xl">
                <Code2 className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="mb-6 text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              Code Nexus
            </h1>
            <p className="text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Track, analyze & share your coding journey to success
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Your all-in-one platform for tracking coding progress across multiple platforms, managing projects, and showcasing your achievements.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg px-8 py-6"
              >
                <Rocket className="mr-2 h-6 w-6" />
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary/20 hover:bg-primary/10 text-lg px-8 py-6"
              >
                <BarChart3 className="mr-2 h-6 w-6" />
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your All-in-One Coding Portfolio
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to track, analyze, and showcase your coding journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Profile Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-xl hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Profile Tracker</CardTitle>
                  <CardDescription>
                    Track your progress across multiple coding platforms in one place
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Cumulative questions solved
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Track streaks across platforms
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Identify strengths & improvements
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-500" />
                      Showcase achievements
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Question Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-xl hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Question Tracker</CardTitle>
                  <CardDescription>
                    Organize and track all your coding questions and notes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Tag & filter questions
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Track coding sheets
                    </li>
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      Enhanced notes system
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      Progress analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* GitHub Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-xl hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mb-4">
                    <Github className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">GitHub Tracker</CardTitle>
                  <CardDescription>
                    Showcase your projects and track development stats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-green-500" />
                      Contribution insights
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Project showcase
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      Collaboration tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      Growth analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Support */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Supported Platforms
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your progress across all major coding platforms
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'LeetCode', color: 'from-orange-500 to-yellow-500', icon: '🧮' },
              { name: 'GeeksforGeeks', color: 'from-green-500 to-emerald-500', icon: '📚' },
              { name: 'HackerRank', color: 'from-blue-500 to-cyan-500', icon: '💻' },
              { name: 'CodeChef', color: 'from-red-500 to-pink-500', icon: '🍽️' },
              { name: 'Codeforces', color: 'from-purple-500 to-indigo-500', icon: '⚔️' },
              { name: 'AtCoder', color: 'from-gray-500 to-gray-700', icon: '🏁' },
            ].map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <span className="text-2xl">{platform.icon}</span>
                </div>
                <p className="font-medium">{platform.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ready to unlock your Coding Portfolio?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers tracking their coding journey
            </p>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg px-12 py-6"
            >
              <Rocket className="mr-2 h-6 w-6" />
              Start Tracking Now
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
