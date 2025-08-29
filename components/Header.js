import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);

      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
    }
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/auth');
  };

  const handleAnonymousSignIn = async () => {
    const email = `anon${Date.now()}@example.com`;
    const password = 'anonpassword123';

    let userData = null;

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error?.message.includes('already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) return console.log(signInError.message);
        userData = signInData.user;
      } else {
        userData = data.user;
      }

      if (userData) {
        await supabase
          .from('users')
          .upsert({ email: userData.email, name: 'Anonymous' }, { onConflict: ['email'] });
        setUser(userData);
        router.push('/');
      }
    } catch (err) {
      console.log('Anonymous sign-in error:', err);
    }
  };

  const linkStyle = {
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: '0.3s',
  };

  const buttonStyle = {
    padding: '8px 12px',
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: '0.3s',
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 20px',
      borderBottom: '1px solid #eee',
      backgroundColor: '#f9f9f9',
    }}>
      <div style={{ fontWeight: 700, fontSize: 20 }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#333' }}>PixaBeam Events</Link>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link href="/create" style={linkStyle}>+ Create Event</Link>
        {!user ? (
          <>
            <button onClick={handleAnonymousSignIn} style={buttonStyle}>Anonymous Sign In</button>
            <Link href="/auth" style={linkStyle}>Sign In / Sign Up</Link>
          </>
        ) : (
          <>
            <span style={{ marginRight: 8 }}>{user.email}</span>
            <button onClick={handleSignOut} style={{ ...buttonStyle, backgroundColor: '#F44336' }}>Sign Out</button>
          </>
        )}
      </div>
    </header>
  );
}
