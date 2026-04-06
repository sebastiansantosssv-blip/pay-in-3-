import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';
import { getCurrentLevel, Level } from '../constants/levels';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  celular: string;
  tipo_ingreso: string;
  nivel: string;
  cupo_total: number;
  cupo_usado: number;
  pagos_a_tiempo: number;
  pagos_tardios: number;
  puntos: number;
  card_frozen: boolean;
  ahorros_frozen: boolean;
}

export interface Cuota {
  id: string;
  compra_id: string;
  usuario_id: string;
  numero_cuota: number;
  monto: number;
  fecha_vencimiento: string;
  estado: 'pendiente' | 'pagada' | 'vencida';
  paid_at: string | null;
  // Joined from compras
  icono?: string;
  tienda?: string;
  monto_total?: number;
  num_cuotas?: number;
}

export interface Pago {
  id: string;
  cuota_id: string | null;
  usuario_id: string;
  monto: number;
  tienda: string | null;
  icono: string | null;
  descripcion: string | null;
  created_at: string;
}

export interface AhorroEntry {
  id: string;
  usuario_id: string;
  compra_id: string | null;
  monto: number;
  tipo: 'deposito' | 'retiro';
  created_at: string;
  // Joined
  icono?: string;
  tienda?: string;
  monto_total?: number;
}

interface UserContextType {
  user: Usuario | null;
  cuotas: Cuota[];
  pagos: Pago[];
  ahorros: AhorroEntry[];
  level: Level;
  loading: boolean;
  refresh: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshCuotas: () => Promise<void>;
  refreshPagos: () => Promise<void>;
  refreshAhorros: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  cuotas: [],
  pagos: [],
  ahorros: [],
  level: getCurrentLevel(0),
  loading: true,
  refresh: async () => {},
  refreshUser: async () => {},
  refreshCuotas: async () => {},
  refreshPagos: async () => {},
  refreshAhorros: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [user, setUser] = useState<Usuario | null>(null);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [ahorros, setAhorros] = useState<AhorroEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  const refreshUser = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('usuarios').select('*').eq('id', userId).single();
    if (data) setUser(data as Usuario);
  }, [userId]);

  const refreshCuotas = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('cuotas')
      .select('*, compras(icono, tienda, monto_total, num_cuotas)')
      .eq('usuario_id', userId)
      .order('fecha_vencimiento', { ascending: true });
    if (data) {
      setCuotas(data.map((c: any) => ({
        ...c,
        icono: c.compras?.icono,
        tienda: c.compras?.tienda,
        monto_total: c.compras?.monto_total,
        num_cuotas: c.compras?.num_cuotas,
      })));
    }
  }, [userId]);

  const refreshPagos = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('pagos')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });
    if (data) setPagos(data as Pago[]);
  }, [userId]);

  const refreshAhorros = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('ahorros')
      .select('*, compras(icono, tienda, monto_total)')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });
    if (data) {
      setAhorros(data.map((a: any) => ({
        ...a,
        icono: a.compras?.icono,
        tienda: a.compras?.tienda,
        monto_total: a.compras?.monto_total,
      })));
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshUser(), refreshCuotas(), refreshPagos(), refreshAhorros()]);
    setLoading(false);
  }, [refreshUser, refreshCuotas, refreshPagos, refreshAhorros]);

  useEffect(() => {
    if (userId) {
      refresh();
    } else {
      setUser(null);
      setCuotas([]);
      setPagos([]);
      setAhorros([]);
      setLoading(false);
    }
  }, [userId, refresh]);

  const level = getCurrentLevel(user?.pagos_a_tiempo ?? 0);

  return (
    <UserContext.Provider value={{ user, cuotas, pagos, ahorros, level, loading, refresh, refreshUser, refreshCuotas, refreshPagos, refreshAhorros }}>
      {children}
    </UserContext.Provider>
  );
}
