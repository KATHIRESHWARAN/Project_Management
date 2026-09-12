import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import ToggleButton from '../components/ToggleButton';
import Logo from '../components/Logo';

const Landing = () => {
  const { isAuthenticated, user } = useAuth();
  const { isCosmic, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('board');

  return (
    <div className="landing-page">
      {/* SaaS Navbar */}
      <header className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Logo size={36} />
          <span className="sidebar-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)' }}>SaaS</span>
        </div>

        <nav className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#workflow" className="landing-nav-link">Workflow</a>
          <a href="#preview" className="landing-nav-link">Platform Preview</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ToggleButton
            id="landing-nav-theme-toggle"
            checked={isCosmic}
            onChange={toggleTheme}
            title={isCosmic ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          />

          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary" id="landing-dashboard-cta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9"></rect>
                <rect x="14" y="3" width="7" height="5"></rect>
                <rect x="14" y="12" width="7" height="9"></rect>
                <rect x="3" y="16" width="7" height="5"></rect>
              </svg>
              Go to Dashboard ({user?.fullName ? user.fullName.split(' ')[0] : 'User'})
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" id="landing-login-btn">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" id="landing-register-btn">
                Get Started Free →
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-badge">
          <span>✨ Enterprise Project Delivery Workspace</span>
        </div>

        <h1 className="landing-title">
          Manage Projects with Clarity.{' '}
          <span className="landing-title-gradient">Accelerate Delivery.</span>
        </h1>

        <p className="landing-subtitle">
          TaskForge is the unified workspace built for high-velocity teams. Plan initiatives, 
          prioritize tasks with Kanban boards, and track real-time delivery metrics in one elegant interface.
        </p>

        <div className="landing-cta-row">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg" id="hero-go-dashboard">
              Open Your Workspace →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg" id="hero-get-started">
                Start Managing Free
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" id="hero-sign-in">
                Sign In to Account
              </Link>
            </>
          )}
        </div>

        {/* Interactive Platform Mockup Preview */}
        <div id="preview" className="landing-preview-wrapper">
          <div className="landing-preview-window">
            <div className="preview-window-header">
              <span className="preview-dot" style={{ backgroundColor: '#ef4444' }}></span>
              <span className="preview-dot" style={{ backgroundColor: '#f59e0b' }}></span>
              <span className="preview-dot" style={{ backgroundColor: '#10b981' }}></span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.75rem' }}>
                taskforge.app/dashboard
              </span>
            </div>

            <div className="preview-window-content">
              {/* Mock Dashboard Top Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Q3 Product Engineering Workspace
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                    Real-time project health & milestone tracking
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className={`btn btn-sm ${activeTab === 'board' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('board')}
                  >
                    Kanban View
                  </button>
                  <button 
                    type="button" 
                    className={`btn btn-sm ${activeTab === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('table')}
                  >
                    Table View
                  </button>
                </div>
              </div>

              {/* Mock Metric Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Active Projects</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4f46e5' }}>8</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Tasks</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>34</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Completed</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>28</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Health Score</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#06b6d4' }}>94%</div>
                </div>
              </div>

              {/* Dynamic View Mock */}
              {activeTab === 'board' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
                  {/* Column 1: Pending */}
                  <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      <span>PENDING</span>
                      <span className="badge badge-status-PENDING" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>2</span>
                    </div>
                    <div style={{ background: '#ffffff', padding: '0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Audit Database Indexes</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem' }}>
                        <span className="badge badge-priority-HIGH" style={{ padding: '1px 5px', fontSize: '0.65rem' }}>HIGH</span>
                        <span style={{ color: '#94a3b8' }}>Due in 2d</span>
                      </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Write OpenAPI Spec</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem' }}>
                        <span className="badge badge-priority-MEDIUM" style={{ padding: '1px 5px', fontSize: '0.65rem' }}>MEDIUM</span>
                        <span style={{ color: '#94a3b8' }}>Due in 5d</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: In Progress */}
                  <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>
                      <span>IN PROGRESS</span>
                      <span className="badge badge-status-IN_PROGRESS" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>1</span>
                    </div>
                    <div style={{ background: '#ffffff', padding: '0.7rem', borderRadius: '8px', border: '1px solid #fde68a', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Refactor Auth Microservice</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem' }}>
                        <span className="badge badge-priority-HIGH" style={{ padding: '1px 5px', fontSize: '0.65rem' }}>HIGH</span>
                        <span style={{ color: '#b45309', fontWeight: 600 }}>In Review</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Completed */}
                  <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, color: '#065f46' }}>
                      <span>COMPLETED</span>
                      <span className="badge badge-status-COMPLETED" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>3</span>
                    </div>
                    <div style={{ background: '#ffffff', padding: '0.7rem', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '0.5rem', opacity: 0.85 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, textDecoration: 'line-through', color: '#64748b' }}>Deploy Production SSL</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem' }}>
                        <span className="badge badge-priority-LOW" style={{ padding: '1px 5px', fontSize: '0.65rem' }}>LOW</span>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Done</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="table-responsive" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="data-table" style={{ fontSize: '0.825rem' }}>
                    <thead>
                      <tr>
                        <th>Task Name</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Target Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Audit Database Indexes</td>
                        <td><span className="badge badge-priority-HIGH">HIGH</span></td>
                        <td><span className="badge badge-status-PENDING">Pending</span></td>
                        <td>2026-09-15</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Refactor Auth Microservice</td>
                        <td><span className="badge badge-priority-HIGH">HIGH</span></td>
                        <td><span className="badge badge-status-IN_PROGRESS">In Progress</span></td>
                        <td>2026-09-18</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Deploy Production SSL</td>
                        <td><span className="badge badge-priority-LOW">LOW</span></td>
                        <td><span className="badge badge-status-COMPLETED">Completed</span></td>
                        <td>2026-09-10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <div className="section-tag">Powerful Capabilities</div>
          <h2 className="section-heading">Engineered for Focused Execution</h2>
          <p className="section-desc">
            Everything you need to orchestrate complex deliverables without administrative friction.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-box">
            <div className="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="18"></rect>
                <rect x="14" y="3" width="7" height="10"></rect>
                <rect x="14" y="17" width="7" height="4"></rect>
              </svg>
            </div>
            <h3 className="feature-title">Interactive Kanban Boards</h3>
            <p className="feature-text">
              Visualize task stages from backlog to delivery. Transition states effortlessly with single-click actions and intuitive column counters.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-box">
            <div className="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3 className="feature-title">Executive Health Analytics</h3>
            <p className="feature-text">
              Track project progress percentages, completion ratios, and status distribution bars in real time without manual reporting spreadsheets.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-box">
            <div className="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 className="feature-title">Priority & Urgency Triage</h3>
            <p className="feature-text">
              Instantly classify tasks into High, Medium, and Low priorities with automated sorting to ensure critical path items are unblocked first.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="feature-box">
            <div className="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <h3 className="feature-title">Multi-View Flexibility</h3>
            <p className="feature-text">
              Switch seamlessly between Kanban boards, detailed data tables, and card grids depending on whether you are planning, triaging, or reviewing.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="feature-box">
            <div className="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="feature-title">Dedicated Project Scopes</h3>
            <p className="feature-text">
              Isolate deliverables inside discrete project containers with customized start dates, completion deadlines, and scoped task assignments.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="feature-box">
            <div className="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 className="feature-title">Enterprise Security</h3>
            <p className="feature-text">
              Cryptographically signed JWT sessions, bcrypt password hashing, and strict authorization boundary enforcement across all database queries.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section id="workflow" className="workflow-section">
        <div className="section-header">
          <div className="section-tag">How It Works</div>
          <h2 className="section-heading">From Concept to Shipped in 3 Steps</h2>
          <p className="section-desc">
            A frictionless operating loop that keeps every stakeholder synchronized.
          </p>
        </div>

        <div className="workflow-steps-grid">
          <div className="workflow-step">
            <div className="workflow-step-num">01</div>
            <h4 className="workflow-step-title">Initialize Projects</h4>
            <p className="workflow-step-desc">
              Define the scope, scheduled start dates, and delivery deadlines for your initiatives in a few seconds.
            </p>
          </div>

          <div className="workflow-step">
            <div className="workflow-step-num">02</div>
            <h4 className="workflow-step-title">Organize & Prioritize Tasks</h4>
            <p className="workflow-step-desc">
              Break work down into manageable tasks. Assign urgency levels, due dates, and detailed instructions.
            </p>
          </div>

          <div className="workflow-step">
            <div className="workflow-step-num">03</div>
            <h4 className="workflow-step-title">Monitor & Execute</h4>
            <p className="workflow-step-desc">
              Leverage the Kanban board and completion analytics to unblock dependencies and hit project targets consistently.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="landing-cta-banner">
        <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Elevate Your Team's Productivity Today
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          Join high-performing engineers and product leads who rely on TaskForge for clarity and velocity.
        </p>
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#ffffff', color: '#1e1b4b', fontWeight: 700 }}>
            Go to My Dashboard →
          </Link>
        ) : (
          <Link to="/register" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#ffffff', color: '#1e1b4b', fontWeight: 700 }}>
            Create Your Free Account →
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div style={{ maxWidth: '340px' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <Logo size={32} />
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8' }}>
              Imagination -&gt; innovation-&gt;invention
            </p>
          </div>

          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Platform
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <a href="#features" style={{ color: '#94a3b8' }}>Features</a>
                <a href="#workflow" style={{ color: '#94a3b8' }}>Workflow</a>
                <a href="#preview" style={{ color: '#94a3b8' }}>Platform Preview</a>
              </div>
            </div>

            <div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Account
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <Link to="/login" style={{ color: '#94a3b8' }}>Sign In</Link>
                <Link to="/register" style={{ color: '#94a3b8' }}>Create Account</Link>
                <Link to="/forgot-password" style={{ color: '#94a3b8' }}>Reset Password</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} TaskForge. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
