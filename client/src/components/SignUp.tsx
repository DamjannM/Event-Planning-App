import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

type UserData = {
  email: string;
  password: string;
};
interface ChildProps {
  token: string;
  setIsRegistered: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignUp: React.FC<ChildProps> = ({ token, setIsRegistered }) => {
  const [user, setUser] = useState<UserData>({ email: '', password: '' });
  const [serverMessage, setServerMessage] = useState('');
  const handleRegister = () => {
    setIsRegistered(true);
  };

  const signUp = async () => {
    if (!user.email.includes('@') && !user.email.includes('.'))
      return setServerMessage('❌ Invalid email format');
    if (user.password.length < 8)
      return setServerMessage('❌ Password must contain atleast 8 characters');
    const response = await fetch('http://localhost:5000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setServerMessage(`❌ ${data.message}`);
      throw new Error(`Server error: ${response.status}`);
    }
    if (data.token) {
      token = data.token;
      localStorage.setItem('token', token);
    } else {
      throw Error('❌ Failed to authenticate...');
    }
    handleRegister();
  };
  useEffect(() => {
    const handleEnterKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') signUp();
      console.log(event.key);
    };

    window.addEventListener('keydown', handleEnterKeyDown);
    return () => window.removeEventListener('keydown', handleEnterKeyDown);
  });
  return (
    <Box className="justify-center absolute top-1/3 mt-60 flex w-2xs flex-col items-center gap-4 rounded-4xl border-2 border-indigo-500 p-3 shadow-2xl shadow-indigo-200 h-80 bg-indigo-50 ">
      <Typography variant="subtitle2" className='!text-lg'>{serverMessage}</Typography>
      <TextField
        type="email"
        label="email"
        size="small"
        value={user.email}
        onChange={(e) => {
          setUser({ ...user, email: e.target.value });
        }}
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
        value={user.password}
        onChange={(e) => {
          setUser({ ...user, password: e.target.value });
        }}
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
        onClick={signUp}
        size="large"
        className="!rounded-4xl"
      >
        Sign Up
      </Button>
      <Typography variant="subtitle2" className='!text-lg'>Already have an account? </Typography>
      <Button onClick={handleRegister} size="large">
        Login
      </Button>
    </Box>
  );
};

export default SignUp;