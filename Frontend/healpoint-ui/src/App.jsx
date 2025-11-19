import './App.scss'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function App() {
  return (
    <div className="app-container text-center">
      <h1 className="mb-3">Bienvenido a HealPoint UI</h1>

      <p className="lead mb-4">
        Proyecto inicial con React + Vite + Bootstrap + SCSS
      </p>

      {/* Botón azul de Bootstrap */}
      <button className="btn button-custom btn-primary btn-lg">
        Comenzar
      </button>
    </div>
  )
}
