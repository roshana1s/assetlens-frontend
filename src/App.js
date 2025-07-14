import "./App.css";
import AppRouter from "./AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AlertProvider } from "./context/AlertContext";


const App = () => {
  return (
    <div className="App">
      <AuthProvider>
        <WebSocketProvider>
          <NotificationProvider>
            <AlertProvider>
              <AppRouter />
            </AlertProvider>
          </NotificationProvider>
        </WebSocketProvider>
      </AuthProvider>
    </div>
  );
};

export default App;