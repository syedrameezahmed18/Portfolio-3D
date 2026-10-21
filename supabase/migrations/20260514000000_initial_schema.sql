-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.app_role NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Internal RLS helper (not callable by clients)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
-- anon cannot call has_role; authenticated can (required for RLS policy evaluation)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Bootstrap check: is any admin registered yet? (used on login page)
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;
REVOKE EXECUTE ON FUNCTION public.admin_exists() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

-- Auto-grant admin role to the very first user who signs up
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_first_admin() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SITE CONTENT ============
CREATE TABLE public.site_content (
  section    TEXT        PRIMARY KEY,
  content    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admin write site content" ON public.site_content
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL,
  image_url       TEXT,
  tags            TEXT[]      NOT NULL DEFAULT '{}',
  live_url        TEXT,
  github_url      TEXT,
  is_contribution BOOLEAN     NOT NULL DEFAULT false,
  sort_order      INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admin write projects" ON public.projects
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SKILLS ============
CREATE TABLE public.skills (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category   TEXT        NOT NULL CHECK (category IN ('frontend', 'backend', 'other')),
  name       TEXT        NOT NULL,
  percentage INT         NOT NULL DEFAULT 80,
  icon       TEXT        NOT NULL DEFAULT '⭐',
  sort_order INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admin write skills" ON public.skills
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES ('cv',             'cv',             true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true) ON CONFLICT DO NOTHING;

-- Admins can list/read/write; public URL access uses Supabase's own public-bucket logic
CREATE POLICY "Admin read cv" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cv' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin write cv" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'cv' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'cv' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin read project-images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin write project-images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));

-- ============ SEED DATA ============
INSERT INTO public.site_content (section, content) VALUES
('hero', jsonb_build_object(
  'greeting',    'Hi there, I''m',
  'name',        'Syed Rameez Ahmed',
  'title',       'FullStack Developer',
  'description', 'I build accessible, user-friendly websites and applications with modern technologies that solve real-world problems and provide seamless user experiences.'
)),
('about', jsonb_build_object(
  'paragraph1', 'I''m a passionate full stack developer with 4+ years of experience building modern web and mobile applications from front to back. My journey in development started during college, and ever since, I''ve been driven by a love for creating intuitive user interfaces and building robust, scalable backend systems.',
  'paragraph2', 'My expertise lies in React and Next ecosystem on frontend, but I''m always exploring new technologies to stay at the cutting edge of web development.',
  'highlights', jsonb_build_array('React & Next.js', 'TypeScript', 'Tailwind CSS', 'UI/UX Design'),
  'hire_url',   'https://www.linkedin.com/in/syed-rameez-ahmed-6b5984199/',
  'cv_url',     '/Syed_Rameez_Ahmed_CV_2025.pdf'
)),
('contact', jsonb_build_object(
  'intro',    'Got a project in mind or want to collaborate? Feel free to reach out. I''m always open to discussing new projects, creative ideas or opportunities.',
  'email',    'noir.ramsam@gmail.com',
  'phone',    '+49 176 67826120',
  'location', 'Leipzig, Germany',
  'github',   'https://github.com/syedrameezahmed18',
  'linkedin', 'https://www.linkedin.com/in/syedrameezahmed18/'
));

INSERT INTO public.skills (category, name, percentage, icon, sort_order) VALUES
('frontend', 'React',        95, '⚛️', 1),
('frontend', 'React Native', 85, '🌐', 2),
('frontend', 'NextJs',       85, '🟨', 3),
('frontend', 'TypeScript',   80, '🔷', 4),
('backend',  'Node.js',      85, '🟩', 1),
('backend',  'Express.js',   80, '🚂', 2),
('backend',  'NestJS',       75, '🛡️', 3),
('backend',  'Django',       70, '🐍', 4),
('other',    'Git & GitHub', 95, '🎨', 1),
('other',    'Project Ops',  85, '🐙', 2),
('other',    'Dev Ops',      70, '🟩', 3);

INSERT INTO public.projects (title, description, image_url, tags, live_url, is_contribution, sort_order) VALUES
('Autilent',
 'Autilent is an AI-powered speech analytics platform designed for contact centers, delivering real-time insights from customer calls using advanced ML and NLP. It automates quality management, improves agent performance, ensures compliance, and helps organizations unlock actionable business intelligence from voice data.',
 NULL, ARRAY['React', 'PrimeUI', 'FastAPI', 'Postgres', 'Redis'], 'https://autilent.com/', true, 1),
('NXTSTIM EcoAI Digital Care Ecosystem',
 'NXTSTIM is a pioneering HealthTech company revolutionizing pain management through innovative neuromodulation technologies. The EcoAI Digital Care Ecosystem integrates wearable technology and AI-powered remote patient monitoring to deliver personalized, data-driven pain therapy and improve patient outcomes.',
 NULL, ARRAY['Nest.js', 'React', 'Zustand', 'Azure'], 'https://nxtstim.com/', true, 2),
('Keyluxe Suites',
 'Keyluxe Suites is your trusted partner in temporary housing, offering a vast network of properties across the nation. From apartments to single-family homes, Keyluxe Suites ensures a smooth journey and a comfortable stay for clients seeking short-term accommodations.',
 NULL, ARRAY['.NET Core', 'Blaze', 'Postgres'], 'https://keyluxesuites.com/', true, 3);
