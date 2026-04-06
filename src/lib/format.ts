/** Format a number as Colombian Pesos: $150.000 */
export function formatCOP(amount: number): string {
  return '$' + amount.toLocaleString('es-CO').replace(/,/g, '.');
}

/** Format a date as "Mar 22, 2026" */
export function formatDate(date: Date): string {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Format a date as "Mar 22" (short) */
export function formatDateShort(date: Date): string {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/** Get current month name in Spanish */
export function getCurrentMonth(): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return months[new Date().getMonth()];
}

/** Get current year */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}
