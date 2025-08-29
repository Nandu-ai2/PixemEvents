import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [city, setCity] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleCreate = async () => {
    setMessage('');

    // Get current user
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      setMessage('You must be signed in to create events.');
      return;
    }

    let finalImageUrl = '';

    // Upload file if selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        setMessage('Image upload failed: ' + uploadError.message);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(uploadData.path);

      finalImageUrl = publicUrl;
    } else if (imageUrl) {
      // If user provided image URL
      finalImageUrl = imageUrl;
    }

    try {
      // Insert event
      const { data: eventData, error } = await supabase.from('events').insert([{
        title,
        description,
        scheduled_at: scheduledAt,
        city,
        created_by: user.id,
        image_url: finalImageUrl || null
      }]);

      if (error) {
        setMessage('Error creating event: ' + error.message);
        return;
      }

      setMessage('Event created successfully!');
      router.push('/'); // Redirect home

    } catch (err) {
      setMessage('Unexpected error: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Create Event</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />

      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />

      <input
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <input
        type="text"
        placeholder="Or paste image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />

      <button onClick={handleCreate} style={{ width: '100%', padding: 10 }}>
        Create Event
      </button>

      {message && (
        <p style={{ marginTop: 12, color: message.includes('Error') ? 'red' : 'green' }}>
          {message}
        </p>
      )}
    </div>
  );
}
