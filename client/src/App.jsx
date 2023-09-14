
import axios from "axios";
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes";
function App() {
  axios.defaults.baseURL = 'http://localhost:8080';
  axios.defaults.withCredentials = true; //used so that we can set cookies from API
  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
   
  )
}

export default App
