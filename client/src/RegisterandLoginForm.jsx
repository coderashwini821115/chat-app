import { useContext, useState } from "react"
import axios from "axios";
import { UserContext } from "./UserContext";

export default function RegisterandLoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const { setUsername: setLoggedUsername, setId } = useContext(UserContext);
    const register = async (e) => {
        e.preventDefault();
        const url = isLogin ? 'login': 'register';
        try {
            const { data } = await axios.post(url, { username, password });
            if(data.id === null) {
                alert('Invalid Username or password');
            }
            setLoggedUsername(username);
            setId(data.id);
        } catch (e) {
            console.log(e);
        }
    }
    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto" onSubmit={register}>
                <input value={username} type="text" onChange={e => setUsername(e.target.value)}
                    placeholder="username"
                    className="block w-full rounded-sm mb-2 p-2" />
                <input value={password} onChange={e => setPassword(e.target.value)}
                    type="password" placeholder="password"
                    className="rounded-sm block w-full mb-2 p-2" />
                <button className="bg-blue-500 w-full text-white block rounded-sm p-2">
                    {!isLogin ? 'Register' : 'Login'}</button>
                <div className="text-center mt-2">
                    {!isLogin && (
                        <div>
                            Already a member?
                            <button onClick={() => setIsLogin(true)}>Login here</button>
                        </div>
                    )}
                    {isLogin &&(
                         <div>
                         Don't have an account?
                         <button onClick={() => setIsLogin(false)}>Register</button>
                     </div>
                    )
                    }
                
                </div>
            </form>
        </div>
    )
}