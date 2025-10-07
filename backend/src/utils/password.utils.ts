import * as bcrypt from 'bcryptjs';
export class PasswordUtils {
  private static readonly DEFAULT_SALT_ROUNDS = 12;

  /**
   * Hashea una contraseña usando bcrypt
   * @param password - La contraseña en texto plano
   * @param saltRounds - Número de rondas de sal (por defecto 12)
   * @returns La contraseña hasheada
   */
  static async hashPassword(
    password: string,
    saltRounds: number = this.DEFAULT_SALT_ROUNDS,
  ): Promise<string> {
    if (!password || typeof password !== 'string') {
      throw new Error('La contraseña debe ser un string no vacío');
    }

    if (saltRounds < 10 || saltRounds > 15) {
      throw new Error('Las rondas de sal deben estar entre 10 y 15');
    }

    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error(
        `Error al hashear la contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }

  /**
   * Compara una contraseña en texto plano con una hasheada
   * @param password - La contraseña en texto plano
   * @param hashedPassword - La contraseña hasheada
   * @returns true si coinciden, false en caso contrario
   */
  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    if (!password || typeof password !== 'string') {
      throw new Error('La contraseña debe ser un string no vacío');
    }

    if (!hashedPassword || typeof hashedPassword !== 'string') {
      throw new Error('La contraseña hasheada debe ser un string no vacío');
    }

    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error(
        `Error al comparar contraseñas: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }

  /**
   * Valida la fortaleza de una contraseña
   * @param password - La contraseña a validar
   * @returns Objeto con isValid y errores
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!password) {
      return { isValid: false, errors: ['La contraseña es requerida'] };
    }

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
