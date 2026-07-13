export class Validator {
  constructor() {
    this.rules = {};
  }

  /**
   * Define reglas para una propiedad del objeto.
   * @param {string} field Nombre del campo
   * @returns {RuleBuilder}
   */
  ruleFor(field) {
    if (!this.rules[field]) {
      this.rules[field] = new RuleBuilder();
    }
    return this.rules[field];
  }

  /**
   * Evalúa el objeto contra las reglas definidas.
   * @param {Object} data Objeto a validar
   * @returns {{ isValid: boolean, errors: Object }}
   */
  validate(data) {
    const errors = {};
    let isValid = true;

    for (const [field, builder] of Object.entries(this.rules)) {
      const value = data[field];
      const fieldErrors = builder.evaluate(value, field);
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
        isValid = false;
      }
    }

    return {
      isValid,
      errors
    };
  }
}

class RuleBuilder {
  constructor() {
    this.checks = [];
  }

  required(message) {
    this.checks.push((val, field) => {
      if (val === undefined || val === null || val === '') {
        return message || `El campo ${field} es obligatorio.`;
      }
      return null;
    });
    return this;
  }

  string(message) {
    this.checks.push((val, field) => {
      if (val !== undefined && val !== null && typeof val !== 'string') {
        return message || `El campo ${field} debe ser una cadena de texto.`;
      }
      return null;
    });
    return this;
  }

  number(message) {
    this.checks.push((val, field) => {
      if (val !== undefined && val !== null && typeof val !== 'number') {
        return message || `El campo ${field} debe ser un número.`;
      }
      return null;
    });
    return this;
  }

  minLength(len, message) {
    this.checks.push((val, field) => {
      if (val && typeof val === 'string' && val.length < len) {
        return message || `El campo ${field} debe tener al menos ${len} caracteres.`;
      }
      return null;
    });
    return this;
  }

  greaterThan(limit, message) {
    this.checks.push((val, field) => {
      if (val !== undefined && val !== null && typeof val === 'number' && val <= limit) {
        return message || `El campo ${field} debe ser mayor a ${limit}.`;
      }
      return null;
    });
    return this;
  }

  // Permite validar colecciones o sub-objetos
  custom(fn) {
    this.checks.push(fn);
    return this;
  }

  evaluate(val, field) {
    const errors = [];
    for (const check of this.checks) {
      const err = check(val, field);
      if (err) errors.push(err);
    }
    return errors;
  }
}
