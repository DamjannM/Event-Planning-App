import { Box, Button, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';

interface ChildProps {
  token: string;
  setIsRegistered: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLogedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login: React.FC<ChildProps> = ({
  token,
  setIsRegistered,
  setIsLogedIn,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const handleRegister = () => {
    setIsRegistered(false);
  };

  const handleLogin = async () => {
    if (!email.includes('@') && !email.includes('.'))
      return setServerMessage('❌ Invalid email format');
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      const data = await response.json();
      setEmail('');
      setPassword('');
      if (!response.ok) {
        setServerMessage(`❌ ${data.message}`);
        throw new Error(`Server error: ${response.status}`);
      }

      if (data.token) {
        token = data.token;
        sessionStorage.setItem('token', token);
      } else {
        throw Error('❌ Failed to authenticate...');
      }
      setIsLogedIn(true);
    } catch (err) {
      console.log('Login failed', err);
    }
  };
  useEffect(() => {
    const handleEnterKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
      handleLogin();
      }
    };

    window.addEventListener('keydown', handleEnterKeyDown);
    return () => window.removeEventListener('keydown', handleEnterKeyDown);
  });
  return (
    <Box className="justify-center absolute top-1/3 mt-60 flex w-2xs flex-col items-center gap-4 rounded-4xl border-2 border-indigo-500 p-3 shadow-2xl shadow-indigo-200 h-90 bg-indigo-50 ">
      <Typography variant="subtitle2" className='!text-lg'>{serverMessage}</Typography>
      <TextField
        label="email"
        size="small"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        value={email}
        sx={{
          input: { color: 'black' },
          label: { color: 'black' },
          '& .MuiOutlinedInput-root': {
            borderRadius: '2rem',
            '&.Mui-focused fieldset': { borderColor: '#3f50b5' },
            '&:hover fieldset': {
              borderColor: '#3f50b5',
            },
            '& fieldset': {
              borderColor: '#3f50b5',
            },
          },
        }}
      />

      <TextField
        label="password"
        type="password"
        size="small"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        value={password}
        sx={{
          input: { color: 'black' },
          label: { color: 'black' },
          '& .MuiOutlinedInput-root': {
            borderRadius: '2rem',
            '&.Mui-focused fieldset': { borderColor: '#3f50b5' },
            '&:hover fieldset': {
              borderColor: '#3f50b5',
            },
            '& fieldset': {
              borderColor: '#3f50b5',
            },
          },
        }}
      />

      <Button
        variant="outlined"
        onClick={handleLogin}
        size="large"
        className="!rounded-4xl"
      >
        Login
      </Button>
      <a href="http://localhost:5173/forgot-password" className='underline'>Forgot password?</a>
      <Typography variant="subtitle2" className='!text-lg'>Don't have an account yet? </Typography>
      <Button onClick={handleRegister} size="large">
        Register
      </Button>
    </Box>
  );
};

export default Login;