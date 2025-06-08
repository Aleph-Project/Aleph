export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  active?: boolean; // nuevo campo para activación
}

// Temporal: almacenamiento en memoria
export const users: User[] = [];
