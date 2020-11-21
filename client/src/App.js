// import logo from './logo.svg';
import Play from "./pages/Play/Play";
import SignUp from "./pages/SignUp/SignUp";
import './App.css';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Cookies from "js-cookie";

function App() {
  if (Cookies.get('username')) {
    Cookies.set('username', Cookies.get('username'), { expires: 7 })
  }
  return (
    <div className="App">
      <Router>
        <Route exact path='/'>
          {Cookies.get('username') ? <Play></Play> : <Redirect to="/signup"></Redirect>}
        </Route>
        <Route exact path='/signup'>
          {Cookies.get('username') ? <Redirect to="/"></Redirect> : <SignUp></SignUp>}
        </Route>
      </Router>
    </div>
  );
}

export default App;
