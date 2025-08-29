import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    setMessage('');
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage('Sign-up error: ' + error.message);
      return;
    }

    await supabase.from('users').insert([{ email, name: email.split('@')[0] }]);
    setMessage(`Sign-up successful! Check ${email} to confirm.`);
  };

  const handleSignIn = async () => {
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage('Sign-in error: ' + error.message);
    } else {
      setMessage(`Signed in successfully!`);
      router.push('/'); // Redirect to main page
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center' }}>Auth Demo</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} />

      <button onClick={handleSignUp} style={{ width: '100%', padding: 10, marginBottom: 8 }}>Sign Up</button>
      <button onClick={handleSignIn} style={{ width: '100%', padding: 10 }}>Sign In</button>

      {message && <p style={{ marginTop: 12, color: 'blue' }}>{message}</p>}
    </div>
  );
}
