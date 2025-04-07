import "./App.css";
import AppRouter from "./AppRoutes";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <div className="App">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </div>
  );
};

export default App;



