import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Box, Button, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';

export function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (password.length < 8)
      return setMessage('❌ Password must contain atleast 8 characters')
    try {
      const res = await fetch(`http://localhost:8080/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setMessage("✅ Password reset successfully!");
      setTimeout(() => navigate("/"), 1000);
    } catch (err: unknown) {
        if (err instanceof Error) {
            setMessage(`❌ ${err.message}`);
        } else {
            setMessage("❌ Unexpected error occurred");
        }
      }
  };

  return (
    <div className="flex justify-center">
    <Box className="justify-center absolute top-1/3 mt-60 flex w-2xs flex-col items-center gap-4 rounded-4xl border-2 border-indigo-500 p-3 shadow-2xl shadow-indigo-200 h-50 bg-indigo-50 ">
      <Typography variant="subtitle2" className='!text-lg'>{message}</Typography>
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
        onClick={()=> handleReset()}
        size="large"
        className="!rounded-4xl"
        >
        Reset Password
      </Button>
    </Box>
      </div>
  );
}