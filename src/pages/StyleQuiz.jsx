import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import "../styles/StyleQuiz.css";

const StyleQuiz = () => {
  const { userInfo } = useContext(UserContext);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fromOrder = localStorage.getItem("fromOrderConfirmation");
    const quizCompleted = localStorage.getItem("quizCompleted");

    if (quizCompleted) {
      navigate("/products");
    } else if (!fromOrder) {
      navigate("/products");
    }
  }, [navigate]);

  const questions = [
    {
      id: "q1",
      question: "What's your fashion vibe today?",
      options: ["Boho", "Minimal", "Party", "Street", "Elegant"]
    },
    {
      id: "q2",
      question: "Preferred time of styling?",
      options: ["Casual Day Out", "Evening Event", "Office Look", "Festive Mood"]
    },
    {
      id: "q3",
      question: "Pick one key element:",
      options: ["Layering", "Statement Jewelry", "Comfort", "Bold Colors"]
    }
  ];

  const handleChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    if (!userInfo?.email) return alert("Please login to submit the quiz.");
    const allAnswered = questions.every((q) => answers[q.id]);
    if (!allAnswered) return alert("Please answer all questions.");

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/style-quiz", {
        email: userInfo.email,
        answers
      });

      localStorage.setItem("quizCompleted", "true");
      localStorage.removeItem("fromOrderConfirmation");
      setQuizSubmitted(true);

      setTimeout(() => {
        navigate("/products");
      }, 2000);
    } catch (error) {
      console.error("Quiz submission error:", error.message);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="style-quiz-container">
      {!quizSubmitted ? (
        <>
          <h2 className="style-quiz-title">✨ Style Quiz</h2>
          {questions.map((q) => (
            <div className="question-card" key={q.id}>
              <p className="question-title">{q.question}</p>
              <div className="options">
                {q.options.map((opt) => (
                  <div
                    key={opt}
                    className={`option ${answers[q.id] === opt ? "selected" : ""}`}
                    onClick={() => handleChange(q.id, opt)}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading} className="submit-btn">
            {loading ? "Submitting..." : "Submit Quiz"}
          </button>
        </>
      ) : (
        <div className="congrats-popup">
          <h2>🎉 Style quiz submitted!</h2>
          <p>Redirecting to products...</p>
        </div>
      )}
    </div>
  );
};

export default StyleQuiz;
