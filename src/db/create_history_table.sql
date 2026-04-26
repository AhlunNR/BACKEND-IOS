-- Tabel untuk menyimpan riwayat pengerjaan kuis dari semua client
CREATE TABLE IF NOT EXISTS public.quiz_history (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  unanswered_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query admin
CREATE INDEX IF NOT EXISTS idx_quiz_history_created_at ON public.quiz_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_history_device_id ON public.quiz_history(device_id);
