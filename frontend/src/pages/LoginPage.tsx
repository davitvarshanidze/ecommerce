import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {login} from "../api";
import {setToken} from "../auth";

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from ?? "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await login(email, password);
            setToken(res.accessToken);
            window.dispatchEvent(new Event("auth-changed"));
            navigate(from);
        } catch (err) {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{padding: 24, fontFamily: "system-ui", maxWidth: 400}}>
            <h1>Login</h1>

            {error && <p style={{color: "crimson"}}>{error}</p>}

            <form onSubmit={onSubmit}>
                <div style={{marginBottom: 12}}>
                    <input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{width: "100%", padding: 8}}
                    />
                </div>

                <div style={{marginBottom: 12}}>
                    <input
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{width: "100%", padding: 8}}
                    />
                </div>

                <button disabled={loading}>
                    {loading ? "Logging in…" : "Login"}
                </button>
            </form>
        </div>
    );
}