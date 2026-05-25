// services/user.api.ts
import { api } from './api';

// GET list user
export const getUsers = () => {
  return api.get('/users');
};

// GET detail
export const getUserById = (id: number) => {
  return api.get(`/users/${id}`);
};

// POST
export const createUser = (data: any) => {
  return api.post('/users', data);
};