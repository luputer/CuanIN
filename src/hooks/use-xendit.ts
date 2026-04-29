// src/hooks/useXendit.ts
import { useEffect, useState } from "react";

export function useXendit() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (document.getElementById("xendit-js")) {
            setReady(true);
            return;
        }

        const script = document.createElement("script");
        script.id = "xendit-js";
        script.src = "https://js.xendit.co/v1/xendit.min.js";
        script.async = true;
        script.onload = () => setReady(true);
        document.body.appendChild(script);
    }, []);

    return ready;
}