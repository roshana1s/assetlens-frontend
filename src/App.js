import "./App.css";
import AppRouter from "./AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

const App = () => {
  return (
    <div className="App">
      <AuthProvider>
        <NotificationProvider>
        <AppRouter />
        </NotificationProvider>
      </AuthProvider>
    </div>
  );
};

export default App;



