/** Backend base URL. Set VITE_API_URL in .env / host env; prod builds must not fall back to localhost. */
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://routenest.onrender.com');
