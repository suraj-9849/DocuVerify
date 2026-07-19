import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, CheckCircle2, Clock, Shield,
  FileEdit, Send, Eye, UserCheck, Activity,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const STATUS_CYCLE = [
  { status: 'DRAFT', color: 'var(--muted-foreground)', icon: FileEdit },
  { status: 'SUBMITTED', color: '#2563eb', icon: Send },
  { status: 'APPROVED', color: 'var(--correct)', icon: CheckCircle2 },
  { status: 'PUBLISHED', color: 'var(--foreground)', icon: Eye },
] as const;

const ROLE_CARDS = [
  {
    role: 'AUTHOR',
    color: '#2563eb',
    actions: ['Create documents', 'Submit for review', 'Edit drafts', 'Track progress'],
    icon: FileEdit,
  },
  {
    role: 'REVIEWER',
    color: '#d97706',
    actions: ['Review submissions', 'Approve / Reject', 'Request changes', 'Add comments'],
    icon: UserCheck,
  },
  {
    role: 'ADMIN',
    color: 'var(--correct)',
    actions: ['Full system access', 'Manage users', 'Override states', 'Audit logs'],
    icon: Shield,
  },
  {
    role: 'VIEWER',
    color: 'var(--muted-foreground)',
    actions: ['View published docs', 'Read-only access', 'Search & filter', 'Export'],
    icon: Eye,
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col page-content">
      <header className="fixed top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center font-semibold text-lg">
            <img src="/logo.png" alt="DocuVerify" className="h-20 w-20 object-contain" />
            <span>DocuVerify</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground border-2 border-border hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {theme === 'dark'
                  ? <><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></>
                  : <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></>
                }
              </svg>
            </button>
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>Sign in</Button>
            <Button onClick={() => navigate('/login')} className="text-sm sm:text-base">
              <span className="hidden sm:inline">Get started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative flex-1 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_100%)]" />
        </div>
        <div className="container text-center">
          <div className="dv-badge mb-6">Document Verification System</div>
          <h1 className="mx-auto max-w-4xl font-bold tracking-tight" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', lineHeight: 1.05, letterSpacing: '-1.5px' }}>
            Streamline your{' '}
            <span style={{ color: 'var(--muted-foreground)' }}>document approvals</span>
            {' '}with confidence
          </h1>
          <p className="subtitle" style={{ maxWidth: '560px', margin: '1.5rem auto 2rem' }}>
            Create, review, and publish documents through a structured approval pipeline.
            Role-based access, full audit trails, and real-time collaboration built for teams.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/login')}>
              Get started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>Sign in</Button>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-12 border-t-2 border-border pt-10 max-w-lg mx-auto">
            {[
              { label: 'Active users', value: '500+' },
              { label: 'Documents', value: '10K+' },
              { label: 'Avg. time', value: '2.4h' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl sm:text-2xl font-bold">{s.value}</p>
                <p className="dv-mono text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE APPROVAL SIMULATION ── */}
      <LiveApprovalDemo />
      {/* ── ROLE MATRIX ── */}
      <RoleMatrixSection />
      {/* ── AUDIT TRAIL VISUALIZATION ── */}
      <AuditTrailSection />
      {/* ── CTA ── */}
      <CTASection />
      {/* ── FOOTER ── */}
      <FooterSection />
    </div>
  );
}

function LiveApprovalDemo() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const { theme } = useTheme();
  const current = STATUS_CYCLE[step];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setStep((s) => (s + 1) % STATUS_CYCLE.length);
          return 0;
        }
        return p + 2;
      });
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const events = [
    { time: '2 min ago', action: 'Document created by Alice', done: step >= 0 },
    { time: '1 min ago', action: 'Submitted for review', done: step >= 1 },
    { time: '30 sec ago', action: 'Approved by Bob', done: step >= 2 },
    { time: 'Now', action: 'Published & live', done: step >= 3 },
  ];

  return (
    <section className="border-t-2 border-border py-20 bg-[var(--highlight)]">
      <div className="container">
        <div className="text-center mb-14">
          <div className="dv-badge mb-4">Live Demo</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, letterSpacing: '-0.5px' }}>
            See it in action
          </h2>
          <p className="subtitle mt-3">Watch a document flow through the entire approval pipeline — live.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-3">
            <div className="border-2 border-border bg-card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs dv-mono mb-1" style={{ letterSpacing: '1px', color: 'var(--muted-foreground)' }}>DOCUMENT #DV-2024-0042</p>
                  <h3 className="text-xl font-bold">Q4 Security Audit Report</h3>
                  <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
                    Comprehensive security audit findings and remediation recommendations for the Q4 review cycle.
                  </p>
                </div>
                <div
                  className="shrink-0 px-3 py-1.5 border-2 font-bold dv-mono text-xs transition-all duration-500"
                  style={{
                    borderColor: current.color,
                    color: current.color,
                    background: theme === 'dark' ? 'transparent' : `${current.color}10`,
                  }}
                >
                  {current.status}
                </div>
              </div>

              <div className="relative h-2 border-2 border-border bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-200"
                  style={{ width: `${progress}%`, background: current.color }}
                />
              </div>

              <div className="flex justify-between mt-2">
                {STATUS_CYCLE.map((s, i) => (
                  <div
                    key={s.status}
                    className="flex items-center gap-1.5 text-xs transition-all duration-300"
                    style={{
                      color: i <= step ? s.color : 'var(--muted-foreground)',
                      opacity: i <= step ? 1 : 0.4,
                    }}
                  >
                    <s.icon className="h-3 w-3" />
                    <span className="hidden sm:inline dv-mono">{s.status}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-4 text-xs dv-mono" style={{ color: 'var(--muted-foreground)' }}>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span>Auto-cycling every {(STATUS_CYCLE.length * 80 * 50) / 1000}s</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3 w-3" />
                  <span>Real-time simulation</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 border-2 border-border bg-card p-5">
            <p className="text-xs dv-mono mb-4" style={{ letterSpacing: '1px', color: 'var(--muted-foreground)' }}>EVENT LOG</p>
            <div className="space-y-4">
              {events.map((event, i) => (
                <div
                  key={i}
                  className="flex gap-3 transition-all duration-500"
                  style={{ opacity: event.done ? 1 : 0.25 }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="h-2.5 w-2.5 rounded-full border-2 mt-1 transition-all duration-500"
                      style={{
                        borderColor: event.done ? 'var(--correct)' : 'var(--border)',
                        background: event.done ? 'var(--correct)' : 'transparent',
                      }}
                    />
                    {i < events.length - 1 && (
                      <div className="w-0 flex-1 border-l-2 border-border mt-1" style={{ borderColor: event.done ? 'var(--correct)' : undefined }} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{event.action}</p>
                    <p className="text-xs dv-mono" style={{ color: 'var(--muted-foreground)' }}>{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleMatrixSection() {
  const { theme } = useTheme();
  const [activeRole, setActiveRole] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveRole((prev) => (prev + 1) % ROLE_CARDS.length);
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, []);

  const role = ROLE_CARDS[activeRole];

  return (
    <section className="border-t-2 border-border py-20">
      <div className="container">
        <div className="text-center mb-14">
          <div className="dv-badge mb-4">Role-Based Access</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Every role, perfectly scoped
          </h2>
          <p className="subtitle mt-3">Each team member sees exactly what they need — nothing more, nothing less.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-3">
            {ROLE_CARDS.map((r, i) => {
              const RoleIcon = r.icon;
              return (
                <button
                  key={r.role}
                  onClick={() => { setActiveRole(i); clearInterval(timerRef.current); }}
                  className="w-full text-left px-4 py-3 border-2 transition-all duration-300"
                  style={{
                    borderColor: i === activeRole ? r.color : 'var(--border)',
                    background: i === activeRole
                      ? (theme === 'dark' ? `${r.color}20` : `${r.color}10`)
                      : 'var(--card)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center border-2"
                      style={{ borderColor: r.color, color: r.color }}
                    >
                      <RoleIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{r.role}</p>
                      <p className="text-xs dv-mono" style={{ color: 'var(--muted-foreground)' }}>{r.actions.length} permissions</p>
                    </div>
                    {i === activeRole && (
                      <div className="ml-auto flex h-5 w-5 items-center justify-center" style={{ background: r.color, color: '#fff' }}>
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-3 border-2 border-border bg-card p-6 transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex h-10 w-10 items-center justify-center border-2"
                style={{ borderColor: role.color, color: role.color, background: theme === 'dark' ? `${role.color}20` : `${role.color}10` }}
              >
                <role.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold">{role.role}</p>
                <p className="text-xs dv-mono" style={{ color: 'var(--muted-foreground)' }}>GRANTED PERMISSIONS</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {role.actions.map((action) => (
                <div key={action} className="flex items-center gap-3 px-3 py-2 border-2 border-border" style={{ background: theme === 'dark' ? 'var(--highlight)' : 'var(--background)' }}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'var(--correct)' }} />
                  <span className="text-sm font-semibold">{action}</span>
                </div>
              ))}
            </div>
            <p className="text-xs dv-mono mt-5" style={{ color: 'var(--muted-foreground)' }}>
              Roles auto-rotate every 3s · Click any role to explore
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuditTrailSection() {
  const { theme } = useTheme();
  const [visibleEvents, setVisibleEvents] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleEvents((prev) => (prev < auditEvents.length ? prev + 1 : 1));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const auditEvents = [
    { action: 'DOCUMENT_CREATED', actor: 'Alice (AUTHOR)', detail: 'Created "Q4 Security Report"', time: '2 min ago' },
    { action: 'STATUS_CHANGED', actor: 'Alice (AUTHOR)', detail: 'DRAFT → SUBMITTED', time: '1 min ago' },
    { action: 'COMMENT_ADDED', actor: 'Bob (REVIEWER)', detail: '"Please add the executive summary"', time: '45 sec ago' },
    { action: 'STATUS_CHANGED', actor: 'Alice (AUTHOR)', detail: 'EDITED & RE-SUBMITTED', time: '30 sec ago' },
    { action: 'STATUS_CHANGED', actor: 'Bob (REVIEWER)', detail: 'SUBMITTED → APPROVED', time: '15 sec ago' },
    { action: 'STATUS_CHANGED', actor: 'Carol (ADMIN)', detail: 'APPROVED → PUBLISHED', time: 'Now' },
  ];

  return (
    <section className="border-t-2 border-border py-20 bg-[var(--highlight)]">
      <div className="container">
        <div className="text-center mb-14">
          <div className="dv-badge mb-4">Audit Trail</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Every action. Immutable. Searchable.
          </h2>
          <p className="subtitle mt-3">Full transparency into who did what and when — because trust is built on evidence.</p>
        </div>

        <div className="max-w-3xl mx-auto border-2 border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b-2 border-border flex items-center gap-3 bg-muted">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-bold">Live Audit Feed</span>
            <span className="ml-auto flex items-center gap-1.5 text-xs dv-mono" style={{ color: 'var(--correct)' }}>
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--correct)' }} />
              LIVE
            </span>
          </div>
          <div className="divide-y-2 divide-border">
            {auditEvents.map((event, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3 transition-all duration-500"
                style={{
                  opacity: i < visibleEvents ? 1 : 0.15,
                  background: i < visibleEvents && i === auditEvents.length - 1
                    ? (theme === 'dark' ? 'rgba(34,197,94,0.08)' : 'rgba(22,163,74,0.05)')
                    : 'transparent',
                }}
              >
                <div
                  className="shrink-0 px-2 py-1 border-2 dv-mono text-[10px] font-bold"
                  style={{
                    borderColor: event.action.includes('STATUS') ? 'var(--correct)' : 'var(--border)',
                    color: event.action.includes('STATUS') ? 'var(--correct)' : 'var(--muted-foreground)',
                  }}
                >
                  {event.action}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{event.actor}</p>
                  <p className="text-xs dv-mono truncate" style={{ color: 'var(--muted-foreground)' }}>{event.detail}</p>
                </div>
                <div className="shrink-0 text-xs dv-mono" style={{ color: 'var(--muted-foreground)' }}>{event.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs dv-mono" style={{ color: 'var(--muted-foreground)' }}>
            New events appear every 2s · {auditEvents.length} events total
          </p>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="border-t-2 border-border py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-2 border-border/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-2 border-border/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border-2 border-border/10" />
      </div>
      <div className="container">
        <div className="mx-auto max-w-3xl text-center relative">
          <div className="dv-badge mb-6">Get Started</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1 }}>
            Your document workflow<br />
            deserves better than email chains.
          </h2>
          <p className="text-lg mt-5 mb-8" style={{ color: 'var(--muted-foreground)' }}>
            Join teams that have cut their approval time by 70%. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/login')} className="text-base px-8">
              Get started for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="text-base px-8">
              <Eye className="h-5 w-5 mr-2" />
              Live demo
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--correct)' }} />
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--correct)' }} />
              Free 14-day trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--correct)' }} />
              Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="border-t-2 border-border py-8">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        <div className="flex items-center font-semibold">
          <img src="/logo.png" alt="DocuVerify" className="h-8 w-8 object-contain" />
          <span>DocuVerify</span>
        </div>
        <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} DocuVerify. All rights reserved.</p>
      </div>
    </footer>
  );
}
