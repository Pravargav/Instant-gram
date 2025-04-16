// src/components/Callback.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { Appcontext } from "../App";


const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user_id, access_token, current_id,setCurrAccTok } = useContext(Appcontext);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      navigate("/error", { state: { error } });
      return;
    }

    if (code) {
      console.log("Authorization code:", code);
      // Exchange code for token (usually server-side)
      exchangeCodeForToken(code)
      .then(data => {
        // Here you can access the returned data
        console.log("Returned data from exchange function:", data);
        
        // You could also set this data to state if needed
        // setTokenData(data);
        
        navigate("/profile");
      })
      .catch(err => {
        console.error("Token exchange error:", err);
        navigate("/error", { state: { error: err.message } });
      });
      // .catch((err) => navigate("/error", { state: { error: err.message } }));
    } else {
      navigate("/");
    }
  }, [searchParams, navigate]);

  const exchangeCodeForToken = async (code) => {
    // In production, this should be a call to your backend
    const response = await axios.post(
      "https://instant-gram-navy.vercel.app/proxy/instagram/token",
      { code }
    );

    // The rest remains the same
    console.log("Authentication successful!");
    console.log(response.data);

    const token = response.data.access_token;
    const id = response.data.user_id;

    localStorage.removeItem('instagram_access_token');
    sessionStorage.removeItem('instagram_access_token');
    window.sessionStorage.setItem("instagram_access_token", token);
    window.sessionStorage.setItem("instagram_user_id", id);

    console.log("user_id"+user_id);
    console.log("access_token"+access_token);
    console.log("current_id"+current_id);
    setCurrAccTok(token);

    console.log("u"+window.sessionStorage.getItem("instagram_access_token"));
    console.log("a"+window.sessionStorage.getItem("instagram_user_id"));

    return response.data;
  };

  return (
    <div className="callback-container">
      <h2>Processing Instagram authorization...</h2>
      <ul>
        <li>{user_id}</li>
        <li>{access_token}</li>
      </ul>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default Callback;
