
import axios from "axios";
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes";
function App() {
  axios.defaults.baseURL = 'https://chat-app-7h0f.onrender.com/';
  axios.defaults.withCredentials = true; //used so that we can set cookies from API
  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
   
  )
}

export default App