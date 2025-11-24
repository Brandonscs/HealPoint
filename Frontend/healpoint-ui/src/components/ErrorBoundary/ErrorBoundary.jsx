import { Component } from 'react';
import './ErrorBoundary.scss';

/**
 * ErrorBoundary: Componente que captura errores en React
 * - Solo funciona con componentes de clase (no con hooks)
 * - Captura errores durante el renderizado, en métodos del ciclo de vida
 * - NO captura errores en: event handlers, código asíncrono, SSR, errores dentro del propio ErrorBoundary
 */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    
    // Estado para saber si hay error
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Método especial de React que se ejecuta cuando hay un error
   * Actualiza el estado para mostrar la UI de error
   */
  static getDerivedStateFromError(error) {
    console.log('🔴 Error capturado por ErrorBoundary:', error);
    
    // Actualiza el estado para mostrar la UI de fallback
    return { hasError: true };
  }

  /**
   * Método para registrar información del error
   * Aquí puedes enviar el error a un servicio como Sentry, LogRocket, etc.
   */
  componentDidCatch(error, errorInfo) {
    console.error('❌ Error completo:', error);
    console.error('📍 Stack trace:', errorInfo.componentStack);
    
    // Guardar información del error en el estado
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Aquí puedes enviar el error a un servicio externo:
    // logErrorToService(error, errorInfo);
  }

  // Método para reintentar (recargar el componente)
  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    // Si hay error, mostramos la UI de error
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>😵 ¡Oops! Algo salió mal</h1>
            <p>Lo sentimos, ha ocurrido un error inesperado.</p>
            
            {/* Mostrar detalles solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Ver detalles del error (solo en desarrollo)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-retry">
                🔄 Reintentar
              </button>
              <button onClick={() => window.location.href = '/'} className="btn-home">
                🏠 Ir al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Si no hay error, renderizar los componentes hijos normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;