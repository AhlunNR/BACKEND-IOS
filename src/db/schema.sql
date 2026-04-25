-- Membuat ekstensi UUID jika belum ada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Membuat tabel questions
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mengaktifkan Row Level Security (RLS) standar Supabase
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Membuat policy agar frontend bisa melakukan fetch (GET/SELECT) tanpa autentikasi admin
CREATE POLICY "Allow public read access to questions" 
ON public.questions 
FOR SELECT 
USING (true);