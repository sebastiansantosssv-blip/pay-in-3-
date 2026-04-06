-- Pay in 3 — Initial Database Schema
-- Run this in Supabase SQL Editor

-- 1. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  fecha_nacimiento TEXT,
  celular TEXT NOT NULL,
  tipo_ingreso TEXT,
  nivel TEXT NOT NULL DEFAULT 'Rookie',
  cupo_total INTEGER NOT NULL DEFAULT 200000,
  cupo_usado INTEGER NOT NULL DEFAULT 0,
  pagos_a_tiempo INTEGER NOT NULL DEFAULT 0,
  pagos_tardios INTEGER NOT NULL DEFAULT 0,
  puntos INTEGER NOT NULL DEFAULT 0,
  card_frozen BOOLEAN NOT NULL DEFAULT true,
  ahorros_frozen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON usuarios FOR UPDATE USING (auth.uid() = id);

-- 2. COMPRAS
CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  icono TEXT NOT NULL DEFAULT '🛍️',
  tienda TEXT NOT NULL,
  monto_total INTEGER NOT NULL,
  num_cuotas INTEGER NOT NULL DEFAULT 1,
  ahorro_generado INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON compras FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can insert own purchases" ON compras FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- 3. CUOTAS
CREATE TABLE IF NOT EXISTS cuotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  numero_cuota INTEGER NOT NULL,
  monto INTEGER NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, pagada, vencida
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cuotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cuotas" ON cuotas FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can insert own cuotas" ON cuotas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own cuotas" ON cuotas FOR UPDATE USING (auth.uid() = usuario_id);

-- 4. PAGOS
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuota_id UUID REFERENCES cuotas(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  monto INTEGER NOT NULL,
  tienda TEXT,
  icono TEXT,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON pagos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can insert own payments" ON pagos FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- 5. AHORROS
CREATE TABLE IF NOT EXISTS ahorros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  compra_id UUID REFERENCES compras(id),
  monto INTEGER NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'deposito', -- deposito, retiro
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ahorros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own savings" ON ahorros FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can insert own savings" ON ahorros FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_compras_usuario ON compras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_usuario ON cuotas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_compra ON cuotas(compra_id);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ahorros_usuario ON ahorros(usuario_id);
