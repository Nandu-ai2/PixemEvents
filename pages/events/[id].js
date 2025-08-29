import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function EventPage(){
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [counts, setCounts] = useState(null);

  useEffect(()=>{
    if (!id) return;
    load();
  },[id]);

  async function load(){
    const { data: ev } = await supabase.from('events').select('*').eq('id', id).single();
    setEvent(ev);
    const { data: c, error } = await supabase.from('event_rsvp_counts').select('*').eq('event_id', id).single();
    if (!error) setCounts(c);
  }

  if (!event) return <div style={{ padding:20 }}>Loading...</div>;

  return (
    <div style={{ padding:20, maxWidth:800, margin:'0 auto' }}>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>{new Date(event.scheduled_at).toLocaleString()}</p>
      <p>{event.city}</p>
      <hr />
      <h3>RSVP Stats</h3>
      {counts ? (
        <div style={{ display:'flex', gap:12 }}>
          <div>Yes: {counts.yes_count}</div>
          <div>Maybe: {counts.maybe_count}</div>
          <div>No: {counts.no_count}</div>
        </div>
      ) : <p>No RSVP data available</p>}
    </div>
  );
}
