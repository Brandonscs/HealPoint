import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Estilos globales
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.scss'

// Componente principal
import App from './App.jsx'

// Renderizado optimizado
const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)