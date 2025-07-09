import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Chatbot.css'; // optional styling

const Chatbot = () => {
  const [flow, setFlow] = useState({});
  const [currentKey, setCurrentKey] = useState("start");
  const [history, setHistory] = useState([]);
  const [finalInput, setFinalInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/chatbot/flow')
      .then(res => setFlow(res.data))
      .catch(err => console.error("Failed to load chatbot flow:", err));
  }, []);

  const handleOptionClick = (option, nextKey) => {
    setHistory([...history, { question: flow[currentKey].question, answer: option }]);
    setCurrentKey(nextKey);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/chatbot/feedback', {
        final_input: finalInput,
        context: history
      });
      console.log(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  if (!flow[currentKey]) return <div className="chatbot">Loading chatbot...</div>;

  const currentNode = flow[currentKey];

  return (
    <div className="chatbot">
      <h2 className="chatbot-title">🧵 Fashion Chatbot</h2>

      <div className="chat-history">
        {history.map((step, index) => (
          <div key={index} className="chat-step">
            <p><strong>You were asked:</strong> {step.question}</p>
            <p><strong>Your answer:</strong> {step.answer}</p>
          </div>
        ))}
      </div>

      {!submitted && (
        <div className="chat-question">
          <p><strong>Q:</strong> {currentNode.question}</p>

          {currentNode.options && (
            <div className="chat-options">
              {Object.entries(currentNode.options).map(([label, nextKey]) => (
                <button key={label} className="chat-option" onClick={() => handleOptionClick(label, nextKey)}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {currentNode.input && (
            <div className="chat-final-input">
              <textarea
                value={finalInput}
                onChange={(e) => setFinalInput(e.target.value)}
                placeholder="Tell us your style idea..."
                rows={4}
              />
              <button className="chat-submit" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          )}
        </div>
      )}

      {submitted && (
        <div className="chat-thankyou">
          <h4>🎉 Thank you for your input! We'll use it to improve your experience.</h4>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
