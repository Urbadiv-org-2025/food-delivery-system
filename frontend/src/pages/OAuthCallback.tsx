import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function base64urlToString(b64url) {
  // If the param was URL-encoded, decode it first
  const raw = decodeURIComponent(b64url);

  // Convert base64url -> base64
  const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding
  const padLen = (4 - (b64.length % 4)) % 4;
  const padded = b64 + "=".repeat(padLen);

  // Decode to bytes, then to UTF-8 string
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const token = params.get("token");
    const userB64 = params.get("user");
    console.log("OAuthCallback params:", { token, userB64 });

    if (token && userB64) {
      try {
        console.log("Decoding user info from base64url:", userB64);
        const jsonStr = base64urlToString(userB64);
        const userJson = JSON.parse(jsonStr); 

        localStorage.setItem("token", JSON.stringify(token));
        localStorage.setItem("user", JSON.stringify(userJson));

        console.log("Decoded user info:", userJson);
        navigate("/app", { replace: true });
      } catch (err) {
        console.error("Failed to decode/parse user JSON:", err);
        navigate("/", { replace: true });
      }
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return null;
}
