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
        if (session) navigate('/', { replace: true });
    }, [navigate]);

    function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!username.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
        if (!isLogin && password.length < 4) { setError('Password must be at least 4 characters.'); return; }
        const result = isLogin ? loginUser(username.trim(), password) : registerUser(username.trim(), password);
        if (result.success) navigate('/', { replace: true });
        else setError(result.error);
    }

    return (
        <div className="auth-page">
            <div className="bg-gradient"></div>
            <div className="bg-grid"></div>
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-logo">
                        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#lg1)" />
                            <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <defs><linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient></defs>
                        </svg>
                        <span>LinkSnip</span>
                    </div>
                    <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p className="auth-subtitle">{isLogin ? 'Log in to manage your links' : 'Sign up to start shortening'}</p>
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="auth-username">Username</label>
                            <input id="auth-username" type="text" placeholder="Enter your username" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} autoFocus />
                        </div>
                        <div className="form-group">
                            <label htmlFor="auth-password">Password</label>
                            <input id="auth-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />
                        </div>
                        {error && <p className="error-msg">{error}</p>}
                        <button type="submit" className="btn-auth" id="auth-submit-btn">{isLogin ? 'Log In' : 'Register'}</button>
                    </form>
                    <p className="auth-switch">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button className="btn-link" onClick={() => { setIsLogin(!isLogin); setError(''); }} id="auth-toggle-btn">{isLogin ? 'Register' : 'Log In'}</button>
                    </p>
                </div>
            </div>
        </div>
    );
}

// ===== SIDEBAR ICONS =====
const icons = {
    create: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    links: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    analytics: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
};

// ===== HOME PAGE (DASHBOARD) =====
function HomePage() {
    const navigate = useNavigate();
    const session = getSession();

    useEffect(() => {
        if (!session) navigate('/auth', { replace: true });
    }, [session, navigate]);

    const [activeTab, setActiveTab] = useState('links');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [maxClicks, setMaxClicks] = useState('');
    const [links, setLinks] = useState([]);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(null);
    const [justCreated, setJustCreated] = useState(null);
    const [editingCode, setEditingCode] = useState(null);
    const [editUrl, setEditUrl] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (session && session.username) {
            getLinks(session.username).then(setLinks);
        }
    }, [session]);

    if (!session) return null;

    function isValidUrl(string) {
        try { const u = new URL(string); return u.protocol === 'http:' || u.protocol === 'https:'; }
        catch { return false; }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        const trimmed = url.trim();
        if (!trimmed) { setError('Please enter a URL.'); return; }
        if (!isValidUrl(trimmed)) { setError('Please enter a valid URL (must start with http:// or https://).'); return; }
        const clickLimit = maxClicks.trim() ? parseInt(maxClicks.trim(), 10) : null;
        if (maxClicks.trim() && (isNaN(clickLimit) || clickLimit < 1)) { setError('Click limit must be a positive number.'); return; }

        setActionLoading(true);
        try {
            const shortCode = generateShortCode();
            const updated = await addLink(trimmed, shortCode, session.username, clickLimit);
            setLinks(updated);
            setUrl('');
            setMaxClicks('');
            setJustCreated(shortCode);
            setActiveTab('links');
            setTimeout(() => setJustCreated(null), 3000);
        } catch (err) {
            setError('Failed to create link.');
        } finally {
            setActionLoading(false);
        }
    }

    function getShortUrl(code) {
        return `${window.location.origin}${window.location.pathname}#/r/${code}`;
    }

    function handleCopy(code) {
        navigator.clipboard.writeText(getShortUrl(code));
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    }

    async function refreshLinks() {
        const updated = await getLinks(session.username);
        setLinks(updated);
    }

    async function handleToggleEnabled(code) {
        const updated = await toggleLinkEnabled(code, session.username);
        setLinks(updated);
    }

    function handleEditStart(link) { setEditingCode(link.shortCode); setEditUrl(link.originalUrl); }

    async function handleEditSave(code) {
        if (!editUrl.trim() || !isValidUrl(editUrl.trim())) return;
        const updated = await updateLinkUrl(code, editUrl.trim(), session.username);
        setLinks(updated);
        setEditingCode(null); setEditUrl('');
    }

    function handleEditCancel() { setEditingCode(null); setEditUrl(''); }

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
    const topLink = links.length > 0 ? links.reduce((a, b) => a.clicks > b.clicks ? a : b) : null;

    const navItems = [
        { id: 'create', label: 'Create Link', icon: icons.create },
        { id: 'links', label: 'My Links', icon: icons.links },
        { id: 'analytics', label: 'Analytics', icon: icons.analytics },
        { id: 'settings', label: 'Settings', icon: icons.settings },
    ];

    return (
        <div className="dashboard-layout">
            <div className="bg-gradient"></div>
            <div className="bg-grid"></div>

            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="btn-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>{icons.menu}</button>
                <div className="logo-sm">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="url(#lgm)" /><path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><defs><linearGradient id="lgm" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient></defs></svg>
                    <span>LinkSnip</span>
                </div>
                <span className="mobile-user">👤 {session.username}</span>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-top">
                    <div className="sidebar-logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="url(#lg2)" /><path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><defs><linearGradient id="lg2" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient></defs></svg>
                        <span>LinkSnip</span>
                    </div>
                    <nav className="sidebar-nav">
                        {navItems.map(item => (
                            <button key={item.id} className={`nav-item ${activeTab === item.id ? 'nav-active' : ''}`}
                                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="user-avatar">{session.username.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                            <span className="user-name">{session.username}</span>
                            <span className="user-role">Pro User</span>
                        </div>
                    </div>
                    <button className="nav-item nav-logout" onClick={handleLogout} id="logout-btn">
                        {icons.logout}
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">

                {/* ===== CREATE LINK TAB ===== */}
                {activeTab === 'create' && (
                    <div className="page-section">
                        <div className="page-header">
                            <h1>Create New Link</h1>
                            <p>Shorten a URL and optionally set a click limit</p>
                        </div>
                        <div className="create-card">
                            <form onSubmit={handleSubmit} className="create-form">
                                <div className="form-group">
                                    <label htmlFor="url-input">Destination URL</label>
                                    <div className="input-wrapper">
                                        <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                        </svg>
                                        <input id="url-input" type="text" placeholder="https://example.com/very-long-url-here..." value={url}
                                            onChange={(e) => { setUrl(e.target.value); setError(''); }} className={error ? 'input-error' : ''} autoFocus />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="max-clicks-input">Click Limit <span className="label-opt">(optional)</span></label>
                                    <input id="max-clicks-input" type="number" min="1" placeholder="e.g. 10 — leave empty for unlimited"
                                        value={maxClicks} onChange={(e) => setMaxClicks(e.target.value)} className="form-input" />
                                </div>
                                {error && <p className="error-msg">{error}</p>}
                                <button type="submit" id="shorten-btn" className="btn-primary btn-lg" disabled={actionLoading}>
                                    <span>{actionLoading ? 'Creating...' : 'Shorten Link'}</span>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                </button>
                            </form>
                            {justCreated && (
                                <div className="success-banner">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    <span>Link created! </span>
                                    <code>{getShortUrl(justCreated)}</code>
                                    <button className="btn-copy-inline" onClick={() => handleCopy(justCreated)}>{copied === justCreated ? 'Copied!' : 'Copy'}</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== MY LINKS TAB ===== */}
                {activeTab === 'links' && (
                    <div className="page-section">
                        <div className="page-header">
                            <h1>My Links</h1>
                            <button className="btn-secondary" onClick={refreshLinks} id="refresh-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                                Refresh
                            </button>
                        </div>

                        {justCreated && (
                            <div className="success-banner" style={{ marginBottom: '1rem' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                <span>Link created! </span>
                                <code>{getShortUrl(justCreated)}</code>
                                <button className="btn-copy-inline" onClick={() => handleCopy(justCreated)}>{copied === justCreated ? 'Copied!' : 'Copy'}</button>
                            </div>
                        )}

                        {links.length === 0 ? (
                            <div className="empty-card">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                <p>No links yet</p>
                                <span>Create your first short link to get started!</span>
                                <button className="btn-primary" onClick={() => setActiveTab('create')} style={{ marginTop: '1rem' }}>+ Create Link</button>
                            </div>
                        ) : (
                            <div className="table-card">
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
                                                                <input type="text" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="edit-input" autoFocus />
                                                                <div className="edit-actions">
                                                                    <button className="btn-save" onClick={() => handleEditSave(link.shortCode)}>Save</button>
                                                                    <button className="btn-cancel" onClick={handleEditCancel}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
                                                                {link.originalUrl.length > 40 ? link.originalUrl.slice(0, 40) + '...' : link.originalUrl}
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="td-short">
                                                        <a href={getShortUrl(link.shortCode)} target="_blank" rel="noopener noreferrer">{link.shortCode}</a>
                                                    </td>
                                                    <td className="td-clicks">
                                                        <span className="click-badge">{link.clicks}{link.maxClicks ? `/${link.maxClicks}` : ''}</span>
                                                        {link.maxClicks && link.clicks >= link.maxClicks && <span className="expired-tag">expired</span>}
                                                    </td>
                                                    <td className="td-date">{formatDate(link.createdAt)}</td>
                                                    <td className="td-date">{formatDate(link.lastAccessedAt)}</td>
                                                    <td>
                                                        <button className={`btn-toggle ${link.enabled !== false ? 'toggle-on' : 'toggle-off'}`}
                                                            onClick={() => handleToggleEnabled(link.shortCode)}>
                                                            {link.enabled !== false ? 'Active' : 'Disabled'}
                                                        </button>
                                                    </td>
                                                    <td className="td-actions">
                                                        <button className="btn-action" onClick={() => handleEditStart(link)} title="Edit URL">✏️</button>
                                                        <button className="btn-action" onClick={() => handleCopy(link.shortCode)} title="Copy">
                                                            {copied === link.shortCode ? '✓' : '📋'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== ANALYTICS TAB ===== */}
                {activeTab === 'analytics' && (
                    <div className="page-section">
                        <div className="page-header">
                            <h1>Analytics</h1>
                            <p>Overview of your link performance</p>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon icon-indigo">{icons.links}</div>
                                <div>
                                    <p className="stat-value">{links.length}</p>
                                    <p className="stat-label">Total Links</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon icon-purple">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                                </div>
                                <div>
                                    <p className="stat-value">{totalClicks}</p>
                                    <p className="stat-label">Total Clicks</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon icon-green">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                </div>
                                <div>
                                    <p className="stat-value">{activeLinks}</p>
                                    <p className="stat-label">Active Links</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon icon-orange">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                </div>
                                <div>
                                    <p className="stat-value">{links.filter(l => l.maxClicks && l.clicks >= l.maxClicks).length}</p>
                                    <p className="stat-label">Expired Links</p>
                                </div>
                            </div>
                        </div>
                        {topLink && (
                            <div className="top-link-card">
                                <h3>🏆 Top Performing Link</h3>
                                <div className="top-link-details">
                                    <p><strong>URL:</strong> <a href={topLink.originalUrl} target="_blank" rel="noopener noreferrer">{topLink.originalUrl.length > 60 ? topLink.originalUrl.slice(0, 60) + '...' : topLink.originalUrl}</a></p>
                                    <p><strong>Short Code:</strong> <code>{topLink.shortCode}</code></p>
                                    <p><strong>Clicks:</strong> <span className="click-badge">{topLink.clicks}</span></p>
                                    <p><strong>Created:</strong> {formatDate(topLink.createdAt)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== SETTINGS TAB ===== */}
                {activeTab === 'settings' && (
                    <div className="page-section">
                        <div className="page-header">
                            <h1>Settings</h1>
                            <p>Manage your account</p>
                        </div>
                        <div className="settings-card">
                            <div className="settings-row">
                                <label>Username</label>
                                <span className="settings-value">{session.username}</span>
                            </div>
                            <div className="settings-row">
                                <label>Total Links Created</label>
                                <span className="settings-value">{links.length}</span>
                            </div>
                            <div className="settings-row">
                                <label>Storage</label>
                                <span className="settings-value">Neon (Cloud DB) + Local Auth</span>
                            </div>
                            <button className="btn-danger" onClick={handleLogout}>
                                {icons.logout}
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}

            </main>
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
