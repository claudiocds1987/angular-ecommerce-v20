export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  token?: string; // El JWT que devuelve el backend (ASP.NET Core)
}
