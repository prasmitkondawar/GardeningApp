import React, { useState } from 'react';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const prompt = `
    You are an expert botanist specializing in house plants and plant care.

    Your goal is to **answer all questions the user asks regarding their plants** in a clear and helpful manner.

    Requirements for your answers:
    - Keep answers specific and focused, between 1 to 3 sentences.
    - Use simple language accessible to beginner and intermediate plant caregivers.
    - Provide actionable advice (e.g., watering frequency, light needs, fertilization, pest control).
    - If the user provides plant symptoms or conditions, offer possible causes and solutions.
    - Include common plant names and scientific names where applicable.
    - Avoid vague or generic responses.
    - If you don't know the answer, respond honestly and suggest ways to find more information.
    - Consider different environments (indoor/outdoor), typical climates, and common plant types.

    You can ask clarifying questions if needed to better understand the user's problem.

    Answer respectfully and with a tone that encourages learning and confidence in plant care.

    Now, please answer the user's question specifically and concisely.
`;

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setLoading(true);

    const body = {
      model: 'gpt-5-mini',  // or your preferred model
      messages: [
        { role: 'system', content: prompt },
        ...messages,
        { role: 'user', content: input }
      ],
      max_tokens: 150,
      temperature: 0.7,
    };

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer YOUR_OPENAI_API_KEY', // Replace with your API key
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      const assistantMessage = data.choices[0].message.content;

      // Add assistant response
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Unable to get response.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, border: '1px solid #ccc' }}>
      <h2>Plant Care Chatbot</h2>

      <div
        style={{
          minHeight: 300,
          border: '1px solid #ddd',
          padding: 10,
          overflowY: 'auto',
          marginBottom: 10,
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              margin: '10px 0',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 12,
                backgroundColor: msg.role === 'user' ? '#cce5ff' : '#e2e3e5',
                maxWidth: '80%',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div>Loading...</div>}
      </div>

      <textarea
        rows={3}
        style={{ width: '100%', padding: 10 }}
        placeholder="Ask a question about your plant..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />
      <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ width: '100%', padding: 10, marginTop: 8 }}>
        Send
      </button>
    </div>
  );
};

export default Chatbot;
