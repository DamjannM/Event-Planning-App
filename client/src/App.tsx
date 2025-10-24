import { useState } from "react";
import { Header } from "./components/Header"
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { UpcomingEvents } from "./components/UpcomingEvents";

function App() {
  const [isRegistered, setIsRegistered] = useState(true);
  const [isLogedIn, setIsLogedIn] = useState(false);
  const token = localStorage.getItem('token') || ''
  const handleLogOut = () => {
    setIsLogedIn(false);
    localStorage.removeItem('token');
  };

  

  return (
    <div className="max-w-dvw min-h-screen background flex justify-center min-w-90">
    <div className="w-full relative flex flex-col items-center text-center background ">
      {isLogedIn ? (<div className="flex flex-col w-full">
        <Header handleLogOut={handleLogOut}/>
        <UpcomingEvents/>
      </div>)
      : isRegistered ? (
      <Login  token={token}
        setIsRegistered={setIsRegistered}
        setIsLogedIn={setIsLogedIn}/>)
        : <SignUp token={token} setIsRegistered={setIsRegistered} />}
    </div>
    </div>
  )
}

export default App
