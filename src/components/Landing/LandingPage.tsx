import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Kanban, Zap, Shield, Globe, ChevronRight,
  Star, ArrowRight, CheckCircle2, MessageSquare, Calendar,
  BarChart3, Layers, Bell
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Static data — sample content
───────────────────────────────────────────── */
const features = [
  {
    icon: <Kanban size={28} />,
    title: 'Visual Kanban Boards',
    desc: 'Organise tasks with drag-and-drop boards. Move cards across custom columns to match your workflow perfectly.',
    color: '#6f42c1',
  },
  {
    icon: <Users size={28} />,
    title: 'Real-Time Team Collaboration',
    desc: 'Invite teammates, assign roles, and watch updates sync instantly across every device — no refreshes needed.',
    color: '#2ea043',
  },
  {
    icon: <Shield size={28} />,
    title: 'Role-Based Access Control',
    desc: 'Managers control the workspace; members stay focused on execution. Full permission management out of the box.',
    color: '#1f6feb',
  },
  {
    icon: <Zap size={28} />,
    title: 'Lightning-Fast Workflow',
    desc: 'Keyboard shortcuts, smart filters, and auto-save keep your team in flow without interruption or friction.',
    color: '#e3b341',
  },
  {
    icon: <BarChart3 size={28} />,
    title: 'Progress Analytics',
    desc: 'Track velocity, spot bottlenecks, and celebrate milestones with built-in team dashboards.',
    color: '#f85149',
  },
  {
    icon: <Bell size={28} />,
    title: 'Smart Notifications',
    desc: 'Get pinged only for what matters — comment mentions, due-date reminders, and status changes.',
    color: '#79c0ff',
  },
];

const testimonials = [
  {
    name: 'Priya Mehra',
    role: 'Engineering Manager · Infosys',
    quote:
      'CollabMaxx replaced three different tools for us. Our sprint planning is sharper and our team actually enjoys standup now.',
    initials: 'PM',
    gradient: 'linear-gradient(135deg, #6f42c1, #8957e5)',
  },
  {
    name: 'Daniel Osei',
    role: 'Founder · ShipFast Studio',
    quote:
      'The role-based permissions gave us the guardrails we needed to onboard clients into our workspace safely.',
    initials: 'DO',
    gradient: 'linear-gradient(135deg, #2ea043, #56d364)',
  },
  {
    name: 'Lena Fischer',
    role: 'Product Lead · Berliner Startup',
    quote:
      'Real-time sync means our distributed team feels like they\'re sitting in the same room. Absolutely game-changing.',
    initials: 'LF',
    gradient: 'linear-gradient(135deg, #1f6feb, #58a6ff)',
  },
];

const steps = [
  { icon: <Users size={22} />, title: 'Create Your Team', desc: 'Sign up, name your workspace, and invite teammates in seconds.' },
  { icon: <Layers size={22} />, title: 'Build Your Board', desc: 'Add columns that match your process — ideas, backlog, in-progress, done.' },
  { icon: <Calendar size={22} />, title: 'Assign & Track', desc: 'Attach cards to members, set due dates, and watch progress unfold live.' },
  { icon: <MessageSquare size={22} />, title: 'Collaborate', desc: 'Comment, mention, and resolve tasks without leaving CollabMaxx.' },
];

const sampleCards = [
  { list: 'Backlog', title: 'Redesign onboarding flow', tag: 'Design', tagColor: '#6f42c1' },
  { list: 'In Progress', title: 'Integrate payment gateway', tag: 'Engineering', tagColor: '#1f6feb' },
  { list: 'In Progress', title: 'Write API docs v2.0', tag: 'Docs', tagColor: '#e3b341' },
  { list: 'In Review', title: 'QA regression on mobile', tag: 'QA', tagColor: '#2ea043' },
  { list: 'Done', title: 'Finalise Q2 OKRs', tag: 'Strategy', tagColor: '#f85149' },
];

const stats = [
  { value: '12k+', label: 'Active Teams' },
  { value: '98%', label: 'Uptime SLA' },
  { value: '4.9★', label: 'User Rating' },
  { value: '60+', label: 'Countries' },
];

/* ─────────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────────── */
function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsVisible = useInView(statsRef as React.RefObject<HTMLElement>);

  return (
    <div className="landing-root">

      {/* ── NAV ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <a href="/" className="landing-logo">
            <img src="/logo.png" alt="CollabMaxx" className="landing-logo-img" />
            <span>CollabMaxx</span>
          </a>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how" className="landing-nav-link">How it works</a>
            <a href="#testimonials" className="landing-nav-link">Reviews</a>
          </div>
          <div className="landing-nav-cta">
            <Link to="/login" className="landing-btn-outline">Log in</Link>
            <Link to="/register" className="landing-btn-solid">Get started free <ArrowRight size={16} /></Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero-bg-orb landing-orb-1" />
        <div className="landing-hero-bg-orb landing-orb-2" />
        <div className="landing-hero-bg-orb landing-orb-3" />

        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <Star size={13} fill="currentColor" /> Trusted by 12,000+ teams worldwide
          </div>
          <h1 className="landing-hero-title">
            Your team's work,<br />
            <span className="landing-gradient-text">beautifully organised</span>
          </h1>
          <p className="landing-hero-sub">
            CollabMaxx brings boards, tasks, and real-time collaboration into one seamless workspace —
            so your team can focus on shipping, not on managing tools.
          </p>
          <div className="landing-hero-actions">
            <Link to="/register" className="landing-btn-hero">
              Start for free <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="landing-btn-hero-secondary">
              Sign in to your account
            </Link>
          </div>
          <p className="landing-hero-note">No credit card required · Free forever for small teams</p>
        </div>

        {/* Mini board preview */}
        <div className="landing-board-preview">
          <div className="lbp-topbar">
            <span className="lbp-dot" style={{ background: '#f85149' }} />
            <span className="lbp-dot" style={{ background: '#e3b341' }} />
            <span className="lbp-dot" style={{ background: '#2ea043' }} />
            <span className="lbp-title">Q3 Product Roadmap — CollabMaxx</span>
          </div>
          <div className="lbp-board">
            {['Backlog', 'In Progress', 'In Review', 'Done'].map((col) => (
              <div key={col} className="lbp-col">
                <div className="lbp-col-title">{col}</div>
                {sampleCards
                  .filter((c) => c.list === col)
                  .map((c, i) => (
                    <div key={i} className="lbp-card">
                      <div className="lbp-card-tag" style={{ background: c.tagColor + '22', color: c.tagColor }}>{c.tag}</div>
                      <div className="lbp-card-title">{c.title}</div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="landing-stats-band" ref={statsRef as React.RefObject<HTMLDivElement>}>
        {stats.map((s) => (
          <div key={s.label} className={`landing-stat ${statsVisible ? 'landing-stat-visible' : ''}`}>
            <span className="landing-stat-value">{s.value}</span>
            <span className="landing-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section className="landing-section" id="features">
        <div className="landing-section-label">
          <Layers size={14} /> Features
        </div>
        <h2 className="landing-section-title">Everything your team needs</h2>
        <p className="landing-section-sub">
          From task creation to delivery, CollabMaxx covers the full lifecycle of collaborative work.
        </p>
        <div className="landing-features-grid">
          {features.map((f) => (
            <div key={f.title} className="landing-feature-card">
              <div className="landing-feature-icon" style={{ background: f.color + '1a', color: f.color }}>
                {f.icon}
              </div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-section landing-how-section" id="how">
        <div className="landing-section-label">
          <Zap size={14} /> How it works
        </div>
        <h2 className="landing-section-title">Up and running in minutes</h2>
        <p className="landing-section-sub">
          No lengthy onboarding. No IT tickets. Just sign up and start collaborating.
        </p>
        <div className="landing-steps">
          {steps.map((s, i) => (
            <div key={s.title} className="landing-step">
              <div className="landing-step-num">{i + 1}</div>
              <div className="landing-step-icon">{s.icon}</div>
              <h3 className="landing-step-title">{s.title}</h3>
              <p className="landing-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="landing-section" id="testimonials">
        <div className="landing-section-label">
          <MessageSquare size={14} /> Testimonials
        </div>
        <h2 className="landing-section-title">Loved by teams everywhere</h2>
        <p className="landing-section-sub">See what real teams are saying about CollabMaxx.</p>
        <div className="landing-testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="landing-testimonial-card">
              <div className="landing-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#e3b341" color="#e3b341" />)}
              </div>
              <p className="landing-testimonial-quote">"{t.quote}"</p>
              <div className="landing-testimonial-author">
                <div className="landing-testimonial-avatar" style={{ background: t.gradient }}>
                  {t.initials}
                </div>
                <div>
                  <div className="landing-testimonial-name">{t.name}</div>
                  <div className="landing-testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CHECKLIST COMPARISON ── */}
      <section className="landing-section landing-compare-section">
        <div className="landing-compare-card">
          <div className="landing-compare-left">
            <div className="landing-section-label" style={{ justifyContent: 'flex-start' }}>
              <Globe size={14} /> Why CollabMaxx
            </div>
            <h2 className="landing-compare-title">Built for how modern teams actually work</h2>
            <ul className="landing-checklist">
              {[
                'Unlimited boards & cards on free tier',
                'Role-based permissions — Manager & Member',
                'Drag-and-drop Kanban with real-time sync',
                'Team workspaces with multi-board support',
                'Instant member invitations by email',
                'Dark-mode native interface',
              ].map((item) => (
                <li key={item} className="landing-checklist-item">
                  <CheckCircle2 size={18} color="#2ea043" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="landing-compare-right">
            <div className="landing-mini-team">
              <div className="lmt-header">
                <span className="lmt-title">🚀 Product Team</span>
                <span className="lmt-members">4 members</span>
              </div>
              {[
                { email: 'alex@teamco.io', role: 'manager', initial: 'A', color: '#6f42c1' },
                { email: 'sara@teamco.io', role: 'member', initial: 'S', color: '#2ea043' },
                { email: 'james@teamco.io', role: 'member', initial: 'J', color: '#1f6feb' },
                { email: 'mia@teamco.io', role: 'member', initial: 'M', color: '#e3b341' },
              ].map((m) => (
                <div key={m.email} className="lmt-row">
                  <div className="lmt-avatar" style={{ background: m.color }}>{m.initial}</div>
                  <div className="lmt-email">{m.email}</div>
                  <div className={`lmt-badge lmt-badge-${m.role}`}>{m.role}</div>
                </div>
              ))}
              <div className="lmt-cta">
                <span>+ Invite a teammate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="landing-cta-section">
        <div className="landing-cta-orb landing-cta-orb-1" />
        <div className="landing-cta-orb landing-cta-orb-2" />
        <div className="landing-cta-content">
          <h2 className="landing-cta-title">Ready to never stop collaborating?</h2>
          <p className="landing-cta-sub">
            Join thousands of teams using CollabMaxx to build better products together.
          </p>
          <div className="landing-cta-actions">
            <Link to="/register" className="landing-btn-hero">
              Create your free account <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="landing-btn-hero-secondary landing-btn-hero-secondary--light">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <img src="/logo.png" alt="CollabMaxx" className="landing-logo-img" />
            <span className="landing-footer-name">CollabMaxx</span>
            <span className="landing-footer-tagline">never stop collaborating</span>
          </div>
          <div className="landing-footer-links">
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
          </div>
          <div className="landing-footer-copy">
            © {new Date().getFullYear()} CollabMaxx. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
