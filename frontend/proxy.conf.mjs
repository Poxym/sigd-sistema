// Proxy de `ng serve`: manda /api (y los estáticos del admin) a Django. En Docker API_URL=http://backend:8000.
const destino = process.env.API_URL || 'http://localhost:8000';
export default {
  '/api': { target: destino, secure: false },
  '/static': { target: destino, secure: false },
};
