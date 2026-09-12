import { useEffect, useRef, useState } from "react";


export default function ChatPanel({ messages, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <p style={{ color: "#7a7a9a", fontSize: 13 }}>No messages yet. Say hi!</p>
        )}
        {messages.map((m, i) => (
          <div className="chat-message" key={i}>
            <div className="msg-header">
              <strong>{m.username}</strong>
              <span>{new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div>{m.message}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">➤</button>
      </form>
    </div>
  );
}
