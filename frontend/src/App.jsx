import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useEffect } from 'react';
import axios from "axios";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    const fetchBackend = async () => {
      const res = await axios.get("https://trail-vei3.vercel.app", { withCredentials: true });
      if (res.data.success) {
        console.log(res.data.message);
        setData(res.data.message);
      }
    }
    fetchBackend();
  }, []);

  return (
    <>
      <p>{data}</p>
    </>
  )
}

export default App
