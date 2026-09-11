import { API_BASE_URL } from '../config/api';

export type LoginResult = {
  token: string;
  isPremium: boolean;
};

export async function login(username: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  return response.json();
}
