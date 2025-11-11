// Use environment variable if set
// In production, VITE_API_URL should be set to the full API URL (e.g., https://yourdomain.com/api)
// In development, if not set, default to localhost
// If empty string is provided, uses relative URLs (same origin - no CORS needed)
const envApiUrl = import.meta.env.VITE_API_URL
const API_URL = envApiUrl !== undefined && envApiUrl !== '' 
  ? envApiUrl 
  : 'http://localhost:3001'

export default API_URL

