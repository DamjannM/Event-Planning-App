import { useState } from "react";
import { Box, Button, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';

export function ForgotPassword(){
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send link");
      }

      setMessage(`✅ ${data.message}`);
      setEmail('')
      window.open(data.preview);
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
            label="email"
            type="email"
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
    
          <Button
            variant="outlined"
            onClick={()=> handleSubmit()}
            size="large"
            className="!rounded-4xl"
            >
            Send request
          </Button>
        </Box>
          </div>
      );
}