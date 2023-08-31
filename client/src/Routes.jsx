import { useContext } from "react";
// import Register from "./RegisterandLoginForm";
import { UserContext } from "./UserContext";
import RegisterandLoginForm from "./RegisterandLoginForm";
import Chat from "./Chat";

export default function Routes() {
    const {username, id} = useContext(UserContext);
    if(username) {
        return <Chat />
    }
    return (
        <RegisterandLoginForm />
    )
}