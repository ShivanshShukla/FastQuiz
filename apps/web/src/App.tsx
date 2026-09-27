import React, { useState } from 'react';
import { FastQuizClient, QUIZ_CONSTANTS, type TopicSummary } from '@fastquiz/shared';
import './App.css';

export const App: React.FC = () => {
  const [topics] = useState<TopicSummary[]>([
    {
      id: 'topic-1',
      name: 'Arrays & Two Pointers',
      description: 'Master core interview patterns with high-frequency questions.',
      total_quizzes: 4,
      free_attempt_available: true,
    },
    {
      id: 'topic-2',
      name: 'System Design Fundamentals',
      description: 'Caching, replication, sharding, and consensus building blocks.',
      total_quizzes: 6,
      free_attempt_available: true,
    },
  ]);

  // Instantiate shared API client
  const client = React.useMemo(() => new FastQuizClient(), []);

  return (
    <div>
      <header className="header">
        <h1>FastQuiz ⚡</h1>
        <p>Prep Fast. Master Interviews. Pay Only For What You Need.</p>
        <small style={{ opacity: 0.8 }}>{Boolean(client) ? 'Client Ready' : 'Initializing'}</small>
      </header>

      <main>
        <h2>Available Topics</h2>
        <p>Every topic includes {QUIZ_CONSTANTS.FREE_ATTEMPTS_PER_TOPIC} free full quiz attempt.</p>

        <div className="card-grid">
          {topics.map((topic) => (
            <div key={topic.id} className="quiz-card">
              <span className="badge">
                {topic.free_attempt_available ? '1 Free Attempt' : 'Paid'}
              </span>
              <h3>{topic.name}</h3>
              <p>{topic.description}</p>
              <small>{topic.total_quizzes} Quizzes Available</small>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
