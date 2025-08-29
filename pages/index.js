import Head from 'next/head';
import Header from '../components/Header';
import EventCard from '../components/EventCard';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents(search) {
    setLoading(true);
    // Try to use view upcoming_events if present; fallback to events table
    let resp;
    if (search) {
      resp = await supabase
        .from('events')
        .select('id,title,description,scheduled_at,city')
        .ilike('title', `%${search}%`)
        .or(`city.ilike.%${search}%`);
    } else {
      resp = await supabase
        .from('upcoming_events')
        .select('*')
        .order('scheduled_at', { ascending: true });
      if (resp.error) {
        // fallback: select from events
        resp = await supabase
          .from('events')
          .select('id,title,description,scheduled_at,city')
          .order('scheduled_at', { ascending: true });
      }
    }
    if (resp.error) console.error(resp.error);
    else setEvents(resp.data || []);
    setLoading(false);
  }

  function onSearch(e) {
    e.preventDefault();
    fetchEvents(q);
  }

  return (
    <div>
      <Head>
        <title>Events — PixaBeam Demo</title>
      </Head>
      <Header />
      <main style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
        <h1>Discover Events</h1>

        <form onSubmit={onSearch} style={{ marginBottom: 16 }}>
          <input
            placeholder="Search by title or city"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            style={{ padding: 10, width: '70%', marginRight: 8 }}
          />
          <button type="submit" style={{ padding: '10px 14px' }}>Search</button>
        </form>

        {loading && <p>Loading...</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {events.map(ev => <EventCard key={ev.id} event={ev} />)}
        </div>
      </main>
    </div>
  );
}
