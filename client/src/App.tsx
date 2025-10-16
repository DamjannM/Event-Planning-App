import { useState } from "react";
import { Header } from "./components/Header"
import Login from "./components/Login";
import SignUp from "./components/SignUp";

function App() {
  const [isRegistered, setIsRegistered] = useState(true);
  const [isLogedIn, setIsLogedIn] = useState(false);
  const token = localStorage.getItem('token') || ''
  
  const handleLogOut = () => {
    setIsLogedIn(false);
    localStorage.removeItem('token');
  };

  return (
    <>
    <div className="background overflow-hidden relative flex h-screen flex-col items-center justify-center text-center">
      {isLogedIn ? (<div>
        <Header handleLogOut={handleLogOut}/>
      
      </div>)
      : isRegistered ? (
      <Login  token={token}
        setIsRegistered={setIsRegistered}
        setIsLogedIn={setIsLogedIn}/>)
        : <SignUp token={token} setIsRegistered={setIsRegistered} />}
    </div>
    </>
  )
}

export default App
