import { useState } from 'react';
import { api } from '../api/client.js';
import ProductCard from './ProductCard.jsx';
import { useToast } from '../context/ToastContext.jsx';

const QUESTIONS = [
  ['room', 'Which room?', [['living', 'Living room'], ['bedroom', 'Bedroom'], ['balcony', 'Balcony / veranda'], ['door', 'Doorway']]],
  ['need', 'What matters most?', [['light', 'Soft light'], ['privacy', 'Privacy'], ['outdoor', 'Weather-proof']]],
  ['budget', 'Budget per window', [['low', 'Under ৳2,500'], ['mid', '৳2,500–4,000'], ['high', '৳4,000+']]]
];

/** "Customized recommendations" user story. Matching happens on the server. */
export default function RecommendationQuiz() {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const pick = (key, value) => { setAnswers((a) => ({ ...a, [key]: value })); setResults(null); };

  const submit = async () => {
    if (QUESTIONS.some(([k]) => !answers[k])) return toast('Pick one option in each question');
    setBusy(true);
    try { setResults(await api.recommend(answers)); }
    catch (e) { toast(e.message); }
    finally { setBusy(false); }
  };

  return (
    <section className="section quiz" id="quiz">
      <h2>Customized recommendations</h2>
      <p style={{ opacity: 0.85, marginTop: 0 }}>Answer three quick questions and we&apos;ll suggest curtains for your space.</p>
      <div className="grid g3" style={{ marginTop: 14 }}>
        {QUESTIONS.map(([key, label, opts]) => (
          <div key={key}>
            <label>{label}</label>
            <div className="opt">
              {opts.map(([v, l]) => (
                <button key={v} className={answers[key] === v ? 'on' : ''} onClick={() => pick(key, v)}>{l}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn" style={{ marginTop: 18, background: 'var(--bamboo)', borderColor: 'var(--bamboo)', color: 'var(--ink)' }} onClick={submit} disabled={busy}>
        {busy ? 'Finding…' : 'Show my picks'}
      </button>
      {results && (
        <div className="grid g4 results" style={{ marginTop: 20 }}>
          {results.length ? results.map((p) => <ProductCard key={p._id} product={p} />) : <p style={{ color: '#fff' }}>No exact match — try another option.</p>}
        </div>
      )}
    </section>
  );
}
