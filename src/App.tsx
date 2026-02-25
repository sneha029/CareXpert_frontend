import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "./context/theme-context";
import AppRoutes from "./routes";
import { useAuthStore } from "./store/authstore";

function App() {
  useEffect(() => {
    // Initialize auth on app load
    useAuthStore.getState().checkAuth();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </Router>
  );
}

export default App;
