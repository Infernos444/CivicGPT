import React, { useState } from 'react';
import './QuestionInput.css';

const QuestionInput = ({ onAskQuestion, disabled }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = () => {
    if (question.trim() && !disabled) {
      onAskQuestion(question);
      setQuestion('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="question-input-container">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask CivicGPT: 'How can I save tax this year?' or 'Explain Section 80C'..."
        disabled={disabled}
        className="question-textarea"
        rows={3}
      />
      <button 
        onClick={handleSubmit} 
        disabled={!question.trim() || disabled}
        className="ask-button"
      >
        🏛️ Ask CivicGPT
      </button>
    </div>
  );
};

export default QuestionInput;