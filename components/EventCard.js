import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import { motion } from "framer-motion";

export default function EventCard({ event }) {
  const { user } = useUser();
  const [rsvp, setRsvp] = useState(null);
  const [counts, setCounts] = useState({ yes: 0, no: 0, maybe: 0 });

  useEffect(() => {
    fetchCounts();
    if (user) fetchUserRsvp();
  }, [user]);

  const fetchCounts = async () => {
    const { data } = await supabase
      .from("rsvps")
      .select("status")
      .eq("event_id", event.id);

    if (!data) return;

    const yes = data.filter((r) => r.status === "Yes").length;
    const no = data.filter((r) => r.status === "No").length;
    const maybe = data.filter((r) => r.status === "Maybe").length;

    setCounts({ yes, no, maybe });
  };

  const fetchUserRsvp = async () => {
    const { data } = await supabase
      .from("rsvps")
      .select("status")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .single();

    if (data) setRsvp(data.status);
  };

  const handleRsvp = async (status) => {
    if (!user) return alert("Please sign in first");

    const { error } = await supabase.from("rsvps").upsert(
      { event_id: event.id, user_id: user.id, status },
      { onConflict: ["event_id", "user_id"] }
    );

    if (!error) {
      setRsvp(status);
      fetchCounts();
    }
  };

  // Colors for buttons
  const colors = { Yes: "#4CAF50", No: "#F44336", Maybe: "#FF9800" };
  const hoverColors = { Yes: "#45a049", No: "#e53935", Maybe: "#fb8c00" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        border: "1px solid #ddd",
        borderRadius: 14,
        overflow: "hidden",
        margin: "20px auto",
        maxWidth: 520,
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
        background: "#fff",
      }}
    >
      {/* Event Image */}
      <div style={{ width: "100%", height: 220, overflow: "hidden" }}>
        <img
          src={event.image_url || "https://via.placeholder.com/520x220?text=Event"}
          alt={event.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Event Content */}
      <div style={{ padding: 20 }}>
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#333" }}>
          {event.title}
        </h3>
        <p style={{ margin: "10px 0", color: "#555", lineHeight: 1.5 }}>
          {event.description}
        </p>
        <p style={{ margin: "6px 0", fontSize: 14, color: "#888" }}>
          🗓 {new Date(event.scheduled_at).toLocaleString()} • 📍 {event.city}
        </p>

        {/* RSVP Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {["Yes", "No", "Maybe"].map((status) => (
            <button
              key={status}
              onClick={() => handleRsvp(status)}
              style={{
                flex: 1,
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                color: rsvp === status ? "#fff" : "#555",
                backgroundColor: rsvp === status ? colors[status] : "#f0f0f0",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                if (rsvp !== status)
                  e.target.style.backgroundColor = hoverColors[status];
              }}
              onMouseLeave={(e) => {
                if (rsvp !== status) e.target.style.backgroundColor = "#f0f0f0";
              }}
            >
              {status} ({counts[status.toLowerCase()]})
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
