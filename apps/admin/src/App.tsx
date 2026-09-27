import React, { useState } from 'react';
import { FastQuizClient, type Question } from '@fastquiz/shared';
import './App.css';

export const App: React.FC = () => {
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([
    {
      id: 'q-mod-1',
      quiz_id: 'quiz-arrays-1',
      text: 'In Python, what is the average time complexity of checking membership `x in s` if `s` is a set?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      correct_option_index: 0,
      explanation: 'Python sets are implemented as hash tables, yielding average O(1) membership lookups.',
      source_type: 'ai_generated',
      review_status: 'pending',
      order: 1,
    },
  ]);

  const client = React.useMemo(() => new FastQuizClient(), []);

  const handleReview = (_id: string, _status: 'approved' | 'rejected') => {
    setPendingQuestions((prev) => prev.filter((q) => q.id !== _id));
  };

  return (
    <div>
      <header className="admin-header">
        <div>
          <h2>FastQuiz Admin Console 🛡️</h2>
          <p>Content Moderation & Review Queue</p>
          <small style={{ opacity: 0.8 }}>{Boolean(client) ? 'API Client Active' : 'Offline'}</small>
        </div>
        <div>
          <span>{pendingQuestions.length} Pending Review</span>
        </div>
      </header>

      <main>
        <h3>Questions Awaiting Review</h3>
        {pendingQuestions.length === 0 ? (
          <p>All pending questions have been reviewed!</p>
        ) : (
          pendingQuestions.map((q) => (
            <div key={q.id} className="review-item">
              <div>
                <small>Source: <strong>{q.source_type}</strong> | Status: <strong>{q.review_status}</strong></small>
                <h4>{q.text}</h4>
                <ul>
                  {q.options.map((opt, idx) => (
                    <li key={idx} style={{ fontWeight: idx === q.correct_option_index ? 'bold' : 'normal' }}>
                      {opt} {idx === q.correct_option_index && '✓ (Correct)'}
                    </li>
                  ))}
                </ul>
                <p><em>Explanation: {q.explanation}</em></p>
              </div>

              <div className="action-buttons">
                <button className="btn-approve" onClick={() => handleReview(q.id, 'approved')}>
                  Approve Question
                </button>
                <button className="btn-reject" onClick={() => handleReview(q.id, 'rejected')}>
                  Reject Question
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default App;
