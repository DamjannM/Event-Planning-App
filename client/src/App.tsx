import { useState } from "react";
import { Header } from "./components/Header"
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { UpcomingEvents } from "./components/UpcomingEvents";
import { Route, Routes } from "react-router-dom";
import { ResetPassword } from "./pages/ResetPassword";
import { ForgotPassword } from "./pages/ForgotPassword";

function App() {
  const [isRegistered, setIsRegistered] = useState(true);
  const [isLogedIn, setIsLogedIn] = useState(false);
  const token = sessionStorage.getItem('token') || ''
  const handleLogOut = () => {
    setIsLogedIn(false);
    sessionStorage.removeItem('token');
  };

  return (
    <Routes>
      <Route path="/forgot-password" element={<ForgotPassword/>} />
      <Route path="/reset-password/:token" element={<ResetPassword/>}/>
      <Route path="/" element={

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
      }/>
    </Routes>
  )
}

export default App
