import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import InstagramAuth from "./components/InstagramAuth";
import Callback from "./components/Callback";
import Dashboard from "./components/Dashboard";
import ImageViewer from "./components/ImageViewer";
import Profile from "./components/Profile";
import ReelViewer from "./components/ReelViewer";
import { useGetUserId } from "./userId";
import { useGetAccessToken } from "./accessToken";
import { createContext,useState } from "react";
import { useGetCurrentId } from "./currentId";


export const Appcontext = createContext();

function App() {
  const user_id=useGetUserId();
  const access_token=useGetAccessToken();
  const current_id=useGetCurrentId();
  const [currIdHelp, setCurrIdHelp] = useState('');
  const [currAccTok, setCurrAccTok] = useState('');

  return (
    <div className="App">
      <Appcontext.Provider
        value={{
            user_id,
            access_token,
            current_id,
            currIdHelp,
            setCurrIdHelp,
            currAccTok,
            setCurrAccTok
        }}
      >
       
        <header className="App-header">
          <h1>Instagram API Integration</h1>
        </header>
        <main></main>
        <Routes>
          <Route path="/" element={<InstagramAuth />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/media-viewer" element={<ImageViewer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reels-viewer" element={<ReelViewer />} />
        </Routes>
      </Appcontext.Provider>
    </div>
  );
}

export default App;
