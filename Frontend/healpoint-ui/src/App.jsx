import AppRouter from "./routes/AppRouter";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

function App() {
  return (
    // Envuelve toda tu aplicación
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;