import "./App.css";
import AppRouter from "./AppRoutes";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "react-widgets/styles.css";
import "react-datepicker/dist/react-datepicker.css";

const App = () => {
    return (
        <div className="App">
            <AppRouter />
        </div>
    );
};

export default App;