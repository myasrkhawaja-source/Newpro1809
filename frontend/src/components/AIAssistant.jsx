import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AIAssistant.css';
import { API_BASE } from '../config';

const API = `${API_BASE}/ai`;
const ROUTES = ['/products', '/services', '/bookings', '/order-history', '/profile', '/quiz'];

// تنسيق نص الرد: **bold** + عناوين ## + روابط الصفحات
const renderSegment = (seg, keyPrefix) =>
  seg.split(/(\/[a-z-]+)/g).map((part, i) =>
    ROUTES.includes(part)
      ? <Link key={`${keyPrefix}-${i}`} to={part} className="ai-link">هنا</Link>
      : part
  );

const renderText = (raw) =>
  String(raw)
    .replace(/^#{1,3}\s*/gm, '')
    .split(/\*\*(.+?)\*\*/g)
    .map((seg, i) =>
      i % 2 === 1
        ? <strong key={`b-${i}`}>{seg}</strong>
        : <span key={`t-${i}`}>{renderSegment(seg, i)}</span>
    );

const QUICK_CHIPS = ['رشحلي منتجات لبشرتي', 'ايه الخدمات المتاحة؟', 'فين طلبي؟', 'حجوزاتي ايه؟'];

function AIAssistant({ token, user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const push = (role, text) => setMessages((m) => [...m, { role, text, time: new Date() }]);

  const greet = () => {
    if (messages.length === 0) {
      push('ai', `أهلاً ${user?.name?.split(' ')[0] || 'بيك'} 👋 أنا **Lumi** — مساعدتك الذكية في Beauty Hub 💜\nاسأليني عن المنتجات، الخدمات، حجوزاتك أو طلباتك!`);
    }
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading || !token) return;

    setInput('');
    push('user', msg);
    setLoading(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      push('ai', data.reply || 'معلش حصلت مشكلة، جرّبي تاني 🙏');
    } catch {
      push('ai', 'مش قادر أوصل للسيرفر دلوقتي 😔 اتأكدي إن السيرفر شغال وجربي تاني.');
    } finally {
      setLoading(false);
    }
  };

  const getConsultation = async () => {
    if (loading || !token) return;
    push('user', 'عايزة استشارة جمال شخصية 💜');
    setLoading(true);
    try {
      const res = await fetch(`${API}/consultation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      push('ai', data.reply || 'جرّبي تاني 🙏');
      if (data.hasProfile === false) push('ai', '💡 نصيحة: املي الـ Beauty Quiz الأول عشان الاستشارة تبقى أدق بكتير!');
    } catch {
      push('ai', 'مش قادر أوصل للسيرفر دلوقتي 😔');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="ai-assistant">
      {open && (
        <div className="ai-window">
          <div className="ai-header">
            <div className="ai-avatar">🤖</div>
            <div>
              <strong>Lumi</strong>
              <span className="ai-status">مساعدة جمال ذكية • متصلة</span>
            </div>
            <button className="ai-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role === 'user' ? 'user' : 'ai'}`}>
                <div className="ai-bubble">
                  {m.role === 'ai' ? renderText(m.text) : m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-msg ai">
                <div className="ai-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="ai-chips">
            {QUICK_CHIPS.map((chip) => (
              <button key={chip} onClick={() => send(chip)}>{chip}</button>
            ))}
            <button className="ai-consult-chip" onClick={getConsultation}>💜 استشارة شخصية</button>
          </div>

          <form
            className="ai-input"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتبي سؤالك هنا..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>➤</button>
          </form>
        </div>
      )}

      <button
        className="ai-fab"
        onClick={() => { setOpen(!open); if (!open) greet(); }}
        aria-label="AI Assistant"
      >
        {open ? '✕' : '🤖'}
      </button>
    </div>
  );
}

export default AIAssistant;