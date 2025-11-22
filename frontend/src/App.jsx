import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [data, setData] = useState('');
  const [form, setForm] = useState({
    name: '',
    password: '',
    address: '',
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const res = await axios.get('https://trail-vei3.vercel.app/hello', {
          withCredentials: true,
        });
        if (res.data.success) {
          console.log(res.data.message);
          setData(res.data.message);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBackend();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');

    try {
      // POST to your backend that will geocode + save
      const res = await axios.post(
        'https://trail-vei3.vercel.app/api/users',
        form,
        { withCredentials: true }
      );

      if (res.data.success) {
        setStatus('Saved successfully!');
        setForm({ name: '', password: '', address: '' });
      } else {
        setStatus('Something went wrong!');
      }
    } catch (err) {
      console.error(err);
      setStatus('Error while saving!');
    }
  };

  return (
    <>
      <p>{data}</p>
      <hr />

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <br />

        <button type="submit">Save</button>
      </form>

      <p>{status}</p>
    </>
  );
}

export default App;
