import { API_BASE_URL } from '../config/api';
import { PREMIUM_API_KEY } from '../config/secrets';

export async function fetchPremiumContent() {
  const response = await fetch(`${API_BASE_URL}/api/premium`, {
    headers: { 'x-api-key': PREMIUM_API_KEY },
  });

  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Failed to fetch premium content');
  }

  const body = await response.json();
  return body.content;
}
