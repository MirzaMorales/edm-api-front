/**
 * security.utils.ts
 * Utilidades de seguridad para sanitización y validación de entradas del usuario.
 * Estas funciones ayudan a prevenir inyección de código y XSS.
 */

/**
 * Elimina espacios al inicio y al final de un string.
 * Previene errores de autenticación por espacios accidentales.
 */
export function trimInput(value: string): string {
  return value?.trim() ?? '';
}

/**
 * Sanitiza un string eliminando caracteres potencialmente peligrosos.
 * Elimina etiquetas HTML para prevenir XSS en campos de texto libre.
 */
export function sanitizeText(value: string): string {
  if (!value) return '';
  // Eliminar etiquetas HTML del input
  return value
    .trim()
    .replace(/<[^>]*>/g, '') // Eliminar cualquier etiqueta HTML
    .replace(/javascript:/gi, '') // Eliminar protocolo javascript:
    .replace(/on\w+=/gi, ''); // Eliminar manejadores de eventos inline (onclick=, etc.)
}

/**
 * Patrón de validación para nombres de usuario.
 * Solo permite letras, números, guiones y guiones bajos. Sin espacios.
 */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Patrón de validación para nombres propios.
 * Permite letras (incluyendo acentos), espacios y guiones.
 */
export const NAME_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s-]+$/;

/**
 * Patrón de validación para contraseñas seguras.
 * Requiere al menos una mayúscula, una minúscula, un número y un carácter especial.
 */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

/**
 * Verifica si un string contiene caracteres potencialmente maliciosos (básico).
 * Angular ya escapa el HTML al renderizar, pero esto añade una capa extra.
 */
export function hasMaliciousContent(value: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
  ];
  return dangerousPatterns.some(pattern => pattern.test(value));
}
