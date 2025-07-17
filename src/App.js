import "./App.css";
import AppRouter from "./AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "react-widgets/styles.css";
import "react-datepicker/dist/react-datepicker.css";

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