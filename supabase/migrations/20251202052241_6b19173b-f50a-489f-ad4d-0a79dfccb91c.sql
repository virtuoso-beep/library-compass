-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'member');
CREATE TYPE public.member_type AS ENUM ('student', 'faculty', 'staff_member', 'guest');
CREATE TYPE public.member_status AS ENUM ('active', 'inactive', 'suspended', 'expired');
CREATE TYPE public.book_status AS ENUM ('available', 'borrowed', 'reserved', 'lost', 'damaged', 'for_repair');
CREATE TYPE public.resource_type AS ENUM ('book', 'periodical', 'thesis', 'ebook', 'audiovisual');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create authors table
CREATE TABLE public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  biography TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create publishers table
CREATE TABLE public.publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create members table
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  member_type member_type NOT NULL DEFAULT 'guest',
  status member_status NOT NULL DEFAULT 'active',
  photo_url TEXT,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiration_date DATE,
  max_books_allowed INTEGER NOT NULL DEFAULT 3,
  borrowing_period_days INTEGER NOT NULL DEFAULT 14,
  renewal_limit INTEGER NOT NULL DEFAULT 2,
  fine_rate_per_day DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  edition TEXT,
  publication_year INTEGER,
  language TEXT DEFAULT 'English',
  pages INTEGER,
  description TEXT,
  cover_image_url TEXT,
  call_number TEXT,
  resource_type resource_type NOT NULL DEFAULT 'book',
  publisher_id UUID REFERENCES public.publishers(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create book_authors junction table
CREATE TABLE public.book_authors (
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.authors(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, author_id)
);

-- Create book_copies table
CREATE TABLE public.book_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  accession_number TEXT NOT NULL UNIQUE,
  status book_status NOT NULL DEFAULT 'available',
  location TEXT,
  condition_notes TEXT,
  acquired_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create borrowing_transactions table
CREATE TABLE public.borrowing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  book_copy_id UUID REFERENCES public.book_copies(id) ON DELETE CASCADE NOT NULL,
  borrowed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  renewal_count INTEGER NOT NULL DEFAULT 0,
  staff_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create fines table
CREATE TABLE public.fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.borrowing_transactions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  payment_date DATE,
  waived BOOLEAN NOT NULL DEFAULT FALSE,
  waiver_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiration_date DATE NOT NULL,
  fulfilled BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Anyone can view roles" ON public.user_roles FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for read-only reference tables (authors, publishers, categories)
CREATE POLICY "Anyone can view authors" ON public.authors FOR SELECT USING (TRUE);
CREATE POLICY "Staff and admins can manage authors" ON public.authors FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Anyone can view publishers" ON public.publishers FOR SELECT USING (TRUE);
CREATE POLICY "Staff and admins can manage publishers" ON public.publishers FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Staff and admins can manage categories" ON public.categories FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- RLS Policies for members
CREATE POLICY "Anyone can view members" ON public.members FOR SELECT USING (TRUE);
CREATE POLICY "Staff and admins can manage members" ON public.members FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- RLS Policies for books
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT USING (TRUE);
CREATE POLICY "Staff and admins can manage books" ON public.books FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Anyone can view book_authors" ON public.book_authors FOR SELECT USING (TRUE);
CREATE POLICY "Staff and admins can manage book_authors" ON public.book_authors FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- RLS Policies for book_copies
CREATE POLICY "Anyone can view book_copies" ON public.book_copies FOR SELECT USING (TRUE);
CREATE POLICY "Staff and admins can manage book_copies" ON public.book_copies FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- RLS Policies for borrowing_transactions
CREATE POLICY "Anyone can view transactions" ON public.borrowing_transactions FOR SELECT USING (TRUE);
CREATE POLICY "Staff and admins can manage transactions" ON public.borrowing_transactions FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- RLS Policies for fines
CREATE POLICY "Anyone can view fines" ON public.fines FOR SELECT USING (TRUE);
CREATE POLICY "Staff and admins can manage fines" ON public.fines FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- RLS Policies for reservations
CREATE POLICY "Anyone can view reservations" ON public.reservations FOR SELECT USING (TRUE);
CREATE POLICY "Staff and admins can manage reservations" ON public.reservations FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_book_copies_updated_at BEFORE UPDATE ON public.book_copies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_borrowing_transactions_updated_at BEFORE UPDATE ON public.borrowing_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fines_updated_at BEFORE UPDATE ON public.fines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_members_member_id ON public.members(member_id);
CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_book_copies_accession_number ON public.book_copies(accession_number);
CREATE INDEX idx_book_copies_status ON public.book_copies(status);
CREATE INDEX idx_borrowing_transactions_member_id ON public.borrowing_transactions(member_id);
CREATE INDEX idx_borrowing_transactions_due_date ON public.borrowing_transactions(due_date);
CREATE INDEX idx_fines_member_id ON public.fines(member_id);
CREATE INDEX idx_fines_paid ON public.fines(paid);