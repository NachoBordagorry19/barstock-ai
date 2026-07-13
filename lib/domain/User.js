export class User {
  constructor({ id, name, role, active = true }) {
    this.id = id;
    this.name = name;
    this.role = role; // 'ADMIN' | 'DESPACHADOR' | 'RECEPTOR'
    this.active = active;
  }

  isDespachador() {
    return this.role === 'DESPACHADOR' || this.role === 'ADMIN';
  }

  isReceptor() {
    return this.role === 'RECEPTOR' || this.role === 'ADMIN';
  }
}
