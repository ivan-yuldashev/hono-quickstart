import type { login, logout, register } from './auth.routes';

export type LoginRoute = typeof login;
export type LogoutRoute = typeof logout;
export type RegisterRoute = typeof register;
