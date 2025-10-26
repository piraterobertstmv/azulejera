import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// ===============================
// FUNCIONES DE FORMATEO ESPAÑOL
// ===============================

/**
 * Formatea un número al formato español: 1.234,56
 * @param value - El número a formatear
 * @param decimales - Número de decimales (por defecto 2)
 * @returns String formateado en formato español
 */
export function formateoEspanol(value: number | null | undefined, decimales: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0' + (decimales > 0 ? ',' + '0'.repeat(decimales) : '');
  }
  
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(value);
}

/**
 * Formatea un número como moneda en formato español: €1.234,56
 * @param value - El valor monetario a formatear
 * @param decimales - Número de decimales (por defecto 2)
 * @returns String formateado como moneda española
 */
export function formateoMoneda(value: number | null | undefined, decimales: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '€0' + (decimales > 0 ? ',' + '0'.repeat(decimales) : '');
  }
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(value);
}

/**
 * Formatea un porcentaje en formato español: 15,5%
 * @param value - El valor del porcentaje a formatear
 * @param decimales - Número de decimales (por defecto 1)
 * @returns String formateado como porcentaje español
 */
export function formateoPorcentaje(value: number | null | undefined, decimales: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0' + (decimales > 0 ? ',' + '0'.repeat(decimales) : '') + '%';
  }
  
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(value) + '%';
}

/**
 * Parsea un string en formato español a número: "1.234,56" -> 1234.56
 * @param value - El string a parsear
 * @returns Número parseado o null si no es válido
 */
export function parsearEspanol(value: string | null | undefined): number | null {
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  // Limpiar el string: remover espacios y caracteres no numéricos excepto puntos, comas y signos
  const cleaned = value.trim().replace(/[^\d.,-]/g, '');
  
  if (!cleaned) {
    return null;
  }
  
  // Si solo tiene números, convertir directamente
  if (/^\d+$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }
  
  // Manejar formato español: punto como separador de miles, coma como decimal
  let processedValue = cleaned;
  
  // Si tiene tanto punto como coma, verificar el orden
  const lastComma = processedValue.lastIndexOf(',');
  const lastDot = processedValue.lastIndexOf('.');
  
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      // Formato español: 1.234,56 - punto es separador de miles, coma es decimal
      processedValue = processedValue.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato americano: 1,234.56 - coma es separador de miles, punto es decimal
      processedValue = processedValue.replace(/,/g, '');
    }
  } else if (lastComma > -1) {
    // Solo coma: asumimos que es decimal en formato español
    processedValue = processedValue.replace(',', '.');
  } else if (lastDot > -1) {
    // Solo punto: podría ser decimal o separador de miles
    // Si tiene más de 3 dígitos después del punto, es separador de miles
    const afterDot = processedValue.substring(lastDot + 1);
    if (afterDot.length > 3) {
      processedValue = processedValue.replace(/\./g, '');
    }
    // Si tiene 1-2 dígitos después del punto, es decimal
    // Si tiene exactamente 3, es ambiguo - asumimos separador de miles
    else if (afterDot.length === 3) {
      processedValue = processedValue.replace(/\./g, '');
    }
  }
  
  const result = parseFloat(processedValue);
  return isNaN(result) ? null : result;
}

/**
 * Formatea un string para input numérico (mantiene formato mientras se edita)
 * @param value - El valor actual del input
 * @returns String formateado para mostrar en input
 */
export function formateoInput(value: string): string {
  if (!value) return '';
  
  // Solo formatear cuando no se está editando activamente
  const numero = parsearEspanol(value);
  if (numero === null) return value;
  
  // Si es un número entero, no agregar decimales
  if (Number.isInteger(numero)) {
    return formateoEspanol(numero, 0);
  }
  
  return formateoEspanol(numero, 2);
}

/**
 * Valida si un string puede ser parseado como número
 * @param value - El string a validar
 * @returns true si es un número válido
 */
export function esNumeroValido(value: string): boolean {
  return parsearEspanol(value) !== null;
}