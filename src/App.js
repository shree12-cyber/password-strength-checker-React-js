import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import axios from "axios";

import "./App.css";

const pwURL =
    "https://o9etf82346.execute-api.us-east-1.amazonaws.com/staging/password/strength";

function App() {
    const [password, setPassword] = useState(null);
    const [debounceText] = useDebounce(password, 300);
    const [pwRes, setPwRes] = useState(null);
    const [loading, setLoading] = useState(false); //added loading state for UI

    /**
     * Handles Promise request to get password data
     */
    async function handleChecker(pw) {
        setLoading(true);
        const pwReq = await axios.post(pwURL, { password: pw });

        setPwRes(pwReq.data);
        setLoading(false);
    }

    /**
     *  Initiate password check if password has value
     *  uses debounce to avoid spamming server
     */
    useEffect(() => {
        if (password !== null && password !== "") {
            handleChecker(password);
        }

        return () => {
            setPwRes(null);
        };
    }, [debounceText]);

    /**
     * Construct div elements with active classes depending on the score supplied by password data(handleChecker)
     * @returns div elements
     */
    function PasswordStrength({ score }) {
        const divEl = [];
        console.log(score);
        for (let i = 0; i < 4; i++) {
            divEl.push(
                <div
                    key={i}
                    className={(score > i ? "active" : "") + ` strength-item`}
                ></div>
            );
        }

        return divEl;
    }

    return (
        <div className="App">
            <h1>Is your password strong enough?</h1>
            <input
                type="password"
                placeholder="Type a password"
                onKeyUp={(e) => setPassword(e.target.value)}
                autoFocus
            />

            <div id="pw-strength">
                <PasswordStrength score={pwRes?.score ?? 0} />
            </div>

            {loading && <h6>Checking Password..</h6>}
            <br />
            {pwRes && (
                <div className="result-wrapper">
                    {pwRes?.warning && <h3>{pwRes?.warning}</h3>}

                    <span>
                        It will take {pwRes?.guessTimeString} to guess your
                        password
                    </span>

                    {pwRes?.suggestions && (
                        <ul>
                            {pwRes?.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
