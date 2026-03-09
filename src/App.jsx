import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import RedirectHandler from './components/RedirectHandler';
import {
    getLinks, addLink, generateShortCode, updateLinkUrl, toggleLinkEnabled,
    registerUser, loginUser, getSession, logout
} from './utils/storage';

// ===== AUTH PAGE =====
function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const session = getSession();
        if (session) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        if (!isLogin && password.length < 4) {
            setError('Password must be at least 4 characters.');
            return;
        }

        let result;
        if (isLogin) {
            result = loginUser(username.trim(), password);
        } else {
            result = registerUser(username.trim(), password);
        }

        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setError(result.error);
        }
    }

    return (
        <div className="app-container">
            <div className="bg-gradient"></div>
            <div className="bg-grid"></div>

            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-logo">
                        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#logo-grad-auth)" />
                            <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="logo-grad-auth" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span>LinkSnip</span>
                    </div>
                    <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p className="auth-subtitle">{isLogin ? 'Log in to manage your links' : 'Sign up to start shortening'}</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="auth-username">Username</label>
                            <input
                                id="auth-username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="auth-password">Password</label>
                            <input
                                id="auth-password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            />
                        </div>
                        {error && <p className="error-msg">{error}</p>}
                        <button type="submit" className="btn-auth" id="auth-submit-btn">
                            {isLogin ? 'Log In' : 'Register'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button className="btn-link" onClick={() => { setIsLogin(!isLogin); setError(''); }} id="auth-toggle-btn">
                            {isLogin ? 'Register' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

// ===== HOME PAGE (DASHBOARD) =====
function HomePage() {
    const navigate = useNavigate();
    const session = getSession();

    useEffect(() => {
        if (!session) {
            navigate('/auth', { replace: true });
        }
    }, [session, navigate]);

    const [url, setUrl] = useState('');
    const [maxClicks, setMaxClicks] = useState('');
    const [links, setLinks] = useState(session ? getLinks(session.username) : []);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(null);
    const [justCreated, setJustCreated] = useState(null);
    const [editingCode, setEditingCode] = useState(null);
    const [editUrl, setEditUrl] = useState('');

    if (!session) return null;

    function isValidUrl(string) {
        try {
            const u = new URL(string);
            return u.protocol === 'http:' || u.protocol === 'https:';
        } catch {
            return false;
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const trimmed = url.trim();
        if (!trimmed) {
            setError('Please enter a URL.');
            return;
        }
        if (!isValidUrl(trimmed)) {
            setError('Please enter a valid URL (must start with http:// or https://).');
            return;
        }

        const clickLimit = maxClicks.trim() ? parseInt(maxClicks.trim(), 10) : null;
        if (maxClicks.trim() && (isNaN(clickLimit) || clickLimit < 1)) {
            setError('Click limit must be a positive number.');
            return;
        }

        const shortCode = generateShortCode();
        const updated = addLink(trimmed, shortCode, session.username, clickLimit);
        setLinks(updated);
        setUrl('');
        setMaxClicks('');
        setJustCreated(shortCode);
        setTimeout(() => setJustCreated(null), 3000);
    }

    function getShortUrl(code) {
        return `${window.location.origin}${window.location.pathname}#/r/${code}`;
    }

    function handleCopy(code) {
        navigator.clipboard.writeText(getShortUrl(code));
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    }

    function refreshLinks() {
        setLinks(getLinks(session.username));
    }

    function handleToggleEnabled(code) {
        const updated = toggleLinkEnabled(code, session.username);
        setLinks(updated);
    }

    function handleEditStart(link) {
        setEditingCode(link.shortCode);
        setEditUrl(link.originalUrl);
    }

    function handleEditSave(code) {
        if (!editUrl.trim() || !isValidUrl(editUrl.trim())) {
            return;
        }
        const updated = updateLinkUrl(code, editUrl.trim(), session.username);
        setLinks(updated);
        setEditingCode(null);
        setEditUrl('');
    }

    function handleEditCancel() {
        setEditingCode(null);
        setEditUrl('');
    }

    function handleLogout() {
        logout();
        navigate('/auth', { replace: true });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }

    const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
    const activeLinks = links.filter(l => l.enabled !== false).length;

    return (
        <div className="app-container">
            <div className="bg-gradient"></div>
            <div className="bg-grid"></div>

            {/* Header */}
            <header className="header">
                <div className="logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
                        <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                            <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                                <stop stopColor="#6366f1" />
                                <stop offset="1" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span>LinkSnip</span>
                </div>
                <div className="header-right">
                    <span className="header-user">👤 {session.username}</span>
                    <button className="btn-logout" onClick={handleLogout} id="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main">
                {/* URL Input Section */}
                <section className="shorten-section">
                    <h1>Shorten Your Links</h1>
                    <p className="subtitle">Paste a long URL and get a trackable short link instantly</p>

                    <form onSubmit={handleSubmit} className="url-form">
                        <div className="input-wrapper">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            <input
                                id="url-input"
                                type="text"
                                placeholder="https://example.com/very-long-url-here..."
                                value={url}
                                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                                className={error ? 'input-error' : ''}
                                autoFocus
                            />
                            <button type="submit" id="shorten-btn" className="btn-shorten">
                                <span>Shorten</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>
                        </div>
                        <div className="click-limit-row">
                            <label htmlFor="max-clicks-input">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                Click Limit (optional):
                            </label>
                            <input
                                id="max-clicks-input"
                                type="number"
                                min="1"
                                placeholder="e.g. 10"
                                value={maxClicks}
                                onChange={(e) => setMaxClicks(e.target.value)}
                                className="click-limit-input"
                            />
                        </div>
                        {error && <p className="error-msg">{error}</p>}
                    </form>

                    {justCreated && (
                        <div className="success-banner">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Link created! </span>
                            <code>{getShortUrl(justCreated)}</code>
                            <button className="btn-copy-inline" onClick={() => handleCopy(justCreated)}>
                                {copied === justCreated ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    )}
                </section>

                {/* Stats Cards */}
                <section className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon links-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                        </div>
                        <div>
                            <p className="stat-value">{links.length}</p>
                            <p className="stat-label">Total Links</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon clicks-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                        </div>
                        <div>
                            <p className="stat-value">{totalClicks}</p>
                            <p className="stat-label">Total Clicks</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon active-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="stat-value">{activeLinks}</p>
                            <p className="stat-label">Active Links</p>
                        </div>
                    </div>
                </section>

                {/* Dashboard Table */}
                <section className="dashboard-section">
                    <div className="dashboard-header">
                        <h2>Link Dashboard</h2>
                        <button className="btn-refresh" onClick={refreshLinks} id="refresh-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" />
                                <polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            Refresh
                        </button>
                    </div>

                    {links.length === 0 ? (
                        <div className="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            <p>No links created yet</p>
                            <span>Shorten your first URL above to get started!</span>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table id="links-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Original URL</th>
                                        <th>Short Link</th>
                                        <th>Clicks</th>
                                        <th>Created</th>
                                        <th>Last Accessed</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...links].reverse().map((link, i) => (
                                        <tr key={link.shortCode} className={`${justCreated === link.shortCode ? 'row-new' : ''} ${link.enabled === false ? 'row-disabled' : ''}`}>
                                            <td className="td-num">{links.length - i}</td>
                                            <td className="td-original">
                                                {editingCode === link.shortCode ? (
                                                    <div className="edit-inline">
                                                        <input
                                                            type="text"
                                                            value={editUrl}
                                                            onChange={(e) => setEditUrl(e.target.value)}
                                                            className="edit-input"
                                                            autoFocus
                                                        />
                                                        <div className="edit-actions">
                                                            <button className="btn-save" onClick={() => handleEditSave(link.shortCode)}>Save</button>
                                                            <button className="btn-cancel" onClick={handleEditCancel}>Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
                                                        {link.originalUrl.length > 45 ? link.originalUrl.slice(0, 45) + '...' : link.originalUrl}
                                                    </a>
                                                )}
                                            </td>
                                            <td className="td-short">
                                                <a href={getShortUrl(link.shortCode)} target="_blank" rel="noopener noreferrer">
                                                    {link.shortCode}
                                                </a>
                                            </td>
                                            <td className="td-clicks">
                                                <span className="click-badge">
                                                    {link.clicks}{link.maxClicks ? `/${link.maxClicks}` : ''}
                                                </span>
                                                {link.maxClicks && link.clicks >= link.maxClicks && (
                                                    <span className="expired-tag">expired</span>
                                                )}
                                            </td>
                                            <td className="td-date">{formatDate(link.createdAt)}</td>
                                            <td className="td-date">{formatDate(link.lastAccessedAt)}</td>
                                            <td>
                                                <button
                                                    className={`btn-toggle ${link.enabled !== false ? 'toggle-on' : 'toggle-off'}`}
                                                    onClick={() => handleToggleEnabled(link.shortCode)}
                                                    title={link.enabled !== false ? 'Disable link' : 'Enable link'}
                                                >
                                                    {link.enabled !== false ? 'Active' : 'Disabled'}
                                                </button>
                                            </td>
                                            <td className="td-actions">
                                                <button className="btn-action" onClick={() => handleEditStart(link)} title="Edit URL">
                                                    ✏️
                                                </button>
                                                <button className="btn-action" onClick={() => handleCopy(link.shortCode)} title="Copy short link">
                                                    {copied === link.shortCode ? '✓' : '📋'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            <footer className="footer">
                <p>Built with ⚡ for VIBEATHON 2026 — <strong>LinkSnip</strong></p>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/r/:code" element={<RedirectHandler />} />
        </Routes>
    );
}
