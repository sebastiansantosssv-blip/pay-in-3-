import { supabase } from './supabase';
import { getCurrentLevel, getNextLevel } from '../constants/levels';

/**
 * Create a new purchase with cuotas and auto-savings.
 * Returns the compra ID or throws on error.
 */
export async function crearCompra(params: {
  usuarioId: string;
  icono: string;
  tienda: string;
  montoTotal: number;
  numCuotas: number;
}): Promise<string> {
  const { usuarioId, icono, tienda, montoTotal, numCuotas } = params;
  const ahorroMonto = Math.round(montoTotal * 0.05);
  const cuotaMonto = Math.ceil(montoTotal / numCuotas);

  // 1. Insert compra
  const { data: compra, error: compraErr } = await supabase
    .from('compras')
    .insert({
      usuario_id: usuarioId,
      icono,
      tienda,
      monto_total: montoTotal,
      num_cuotas: numCuotas,
      ahorro_generado: ahorroMonto,
    })
    .select()
    .single();

  if (compraErr || !compra) throw new Error(compraErr?.message || 'Error creando compra');

  // 2. Insert cuotas
  const now = new Date();
  const cuotasData = Array.from({ length: numCuotas }, (_, i) => {
    const fecha = new Date(now);
    fecha.setMonth(fecha.getMonth() + i);
    fecha.setDate(Math.min(fecha.getDate() + 15, 28)); // Due ~15 days from now, capped at 28
    return {
      compra_id: compra.id,
      usuario_id: usuarioId,
      numero_cuota: i + 1,
      monto: i === numCuotas - 1 ? montoTotal - cuotaMonto * (numCuotas - 1) : cuotaMonto, // Last cuota gets remainder
      fecha_vencimiento: fecha.toISOString().split('T')[0],
      estado: 'pendiente',
    };
  });

  const { error: cuotasErr } = await supabase.from('cuotas').insert(cuotasData);
  if (cuotasErr) throw new Error(cuotasErr.message);

  // 3. Insert ahorro deposit
  const { error: ahorroErr } = await supabase.from('ahorros').insert({
    usuario_id: usuarioId,
    compra_id: compra.id,
    monto: ahorroMonto,
    tipo: 'deposito',
  });
  if (ahorroErr) throw new Error(ahorroErr.message);

  // 4. Update cupo_usado on user
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('cupo_usado')
    .eq('id', usuarioId)
    .single();

  if (usuario) {
    await supabase
      .from('usuarios')
      .update({ cupo_usado: usuario.cupo_usado + cuotaMonto }) // Only first cuota counts against cupo
      .eq('id', usuarioId);
  }

  return compra.id;
}

/**
 * Pay a single cuota. Returns the new level if user leveled up, null otherwise.
 */
export async function pagarCuota(params: {
  cuotaId: string;
  usuarioId: string;
  monto: number;
  tienda: string;
  icono: string;
}): Promise<{ leveledUp: boolean; newLevel?: string; newLevelEmoji?: string }> {
  const { cuotaId, usuarioId, monto, tienda, icono } = params;

  // 1. Mark cuota as paid
  const { error: cuotaErr } = await supabase
    .from('cuotas')
    .update({ estado: 'pagada', paid_at: new Date().toISOString() })
    .eq('id', cuotaId);

  if (cuotaErr) throw new Error(cuotaErr.message);

  // 2. Insert payment record
  const { error: pagoErr } = await supabase.from('pagos').insert({
    cuota_id: cuotaId,
    usuario_id: usuarioId,
    monto,
    tienda,
    icono,
  });
  if (pagoErr) throw new Error(pagoErr.message);

  // 3. Update user stats
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('pagos_a_tiempo, puntos, cupo_usado, cupo_total')
    .eq('id', usuarioId)
    .single();

  if (!usuario) throw new Error('Usuario no encontrado');

  const newPagos = usuario.pagos_a_tiempo + 1;
  const newPuntos = newPagos * 11;
  const newCupoUsado = Math.max(0, usuario.cupo_usado - monto);

  // Check level up
  const oldLevel = getCurrentLevel(usuario.pagos_a_tiempo);
  const newLevel = getCurrentLevel(newPagos);
  const leveledUp = newLevel.name !== oldLevel.name;

  const updateData: any = {
    pagos_a_tiempo: newPagos,
    puntos: newPuntos,
    cupo_usado: newCupoUsado,
  };

  if (leveledUp) {
    updateData.nivel = newLevel.name;
    updateData.cupo_total = newLevel.cupo;
  }

  await supabase.from('usuarios').update(updateData).eq('id', usuarioId);

  return leveledUp
    ? { leveledUp: true, newLevel: newLevel.name, newLevelEmoji: newLevel.emoji }
    : { leveledUp: false };
}

/**
 * Pay all pending cuotas for the current month.
 */
export async function pagarTodo(params: {
  cuotas: Array<{ id: string; monto: number; tienda?: string; icono?: string }>;
  usuarioId: string;
}): Promise<{ leveledUp: boolean; newLevel?: string; newLevelEmoji?: string; totalPagado: number }> {
  const { cuotas, usuarioId } = params;
  let leveledUp = false;
  let newLevel: string | undefined;
  let newLevelEmoji: string | undefined;
  let totalPagado = 0;

  for (const cuota of cuotas) {
    const result = await pagarCuota({
      cuotaId: cuota.id,
      usuarioId,
      monto: cuota.monto,
      tienda: cuota.tienda || 'Compra',
      icono: cuota.icono || '\u{1F6CD}\u{FE0F}',
    });
    totalPagado += cuota.monto;
    if (result.leveledUp) {
      leveledUp = true;
      newLevel = result.newLevel;
      newLevelEmoji = result.newLevelEmoji;
    }
  }

  return { leveledUp, newLevel, newLevelEmoji, totalPagado };
}

/**
 * Toggle card freeze status
 */
export async function toggleCardFreeze(usuarioId: string, frozen: boolean) {
  await supabase.from('usuarios').update({ card_frozen: frozen }).eq('id', usuarioId);
}

/**
 * Toggle ahorros freeze status
 */
export async function toggleAhorrosFreeze(usuarioId: string, frozen: boolean) {
  await supabase.from('usuarios').update({ ahorros_frozen: frozen }).eq('id', usuarioId);
}
