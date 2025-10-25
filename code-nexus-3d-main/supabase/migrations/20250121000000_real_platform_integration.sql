-- Additional tables for real platform integration and teacher-student management

-- Student platform connections table
CREATE TABLE IF NOT EXISTS public.student_platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('LEETCODE', 'GEEKSFORGEEKS', 'HACKERRANK', 'CODECHEF', 'CODEFORCES', 'ATCODER')),
    username TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, platform)
);

-- Student profiles table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    total_problems_solved INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    total_badges INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Teacher invitations table
CREATE TABLE IF NOT EXISTS public.teacher_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_email TEXT NOT NULL,
    invitation_code TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Teacher-student relationships table
CREATE TABLE IF NOT EXISTS public.teacher_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (teacher_id, student_id)
);

-- Platform data storage table
CREATE TABLE IF NOT EXISTS public.platform_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('LEETCODE', 'GEEKSFORGEEKS', 'HACKERRANK', 'CODECHEF', 'CODEFORCES', 'ATCODER')),
    username TEXT NOT NULL,
    problems_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    rank INTEGER,
    rating INTEGER,
    badges JSONB DEFAULT '[]'::jsonb,
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_valid BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, platform)
);

-- Enable Row Level Security
ALTER TABLE public.student_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_platform_connections
CREATE POLICY "Users can view own platform connections"
ON public.student_platform_connections FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'TEACHER') OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Users can manage own platform connections"
ON public.student_platform_connections FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for student_profiles
CREATE POLICY "Users can view own profile"
ON public.student_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'TEACHER') OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Users can update own profile"
ON public.student_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.student_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for teacher_invitations
CREATE POLICY "Teachers can manage their invitations"
ON public.teacher_invitations FOR ALL
TO authenticated
USING (auth.uid() = teacher_id OR public.has_role(auth.uid(), 'ADMIN'))
WITH CHECK (auth.uid() = teacher_id OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Anyone can validate invitation codes"
ON public.teacher_invitations FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for teacher_students
CREATE POLICY "Teachers can view their students"
ON public.teacher_students FOR SELECT
TO authenticated
USING (auth.uid() = teacher_id OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Teachers can manage their students"
ON public.teacher_students FOR ALL
TO authenticated
USING (auth.uid() = teacher_id OR public.has_role(auth.uid(), 'ADMIN'))
WITH CHECK (auth.uid() = teacher_id OR public.has_role(auth.uid(), 'ADMIN'));

-- RLS Policies for platform_data
CREATE POLICY "Users can view own platform data"
ON public.platform_data FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'TEACHER') OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Users can manage own platform data"
ON public.platform_data FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_student_platform_connections_updated_at
BEFORE UPDATE ON public.student_platform_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_data_updated_at
BEFORE UPDATE ON public.platform_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_platform_connections_user_id ON public.student_platform_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_student_platform_connections_platform ON public.student_platform_connections(platform);
CREATE INDEX IF NOT EXISTS idx_teacher_invitations_code ON public.teacher_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_teacher_invitations_teacher_id ON public.teacher_invitations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_students_teacher_id ON public.teacher_students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_students_student_id ON public.teacher_students(student_id);
CREATE INDEX IF NOT EXISTS idx_platform_data_user_id ON public.platform_data(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_data_platform ON public.platform_data(platform);



