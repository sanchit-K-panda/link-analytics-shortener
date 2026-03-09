import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findLinkByCode, incrementClick } from '../utils/storage';

export default function RedirectHandler() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading | disabled | expired | redirecting

    useEffect(() => {
        let cancelled = false;

        async function handleRedirect() {
            try {
                const link = await findLinkByCode(code);

                if (cancelled) return;

                if (!link) {
                    navigate('/', { replace: true });
                    return;
                }

                // Check if link is disabled
                if (link.enabled === false) {
                    setStatus('disabled');
                    return;
                }

                // Check if link has exceeded max clicks
                if (link.maxClicks !== null && link.maxClicks !== undefined && link.maxClicks > 0 && link.clicks >= link.maxClicks) {
                    setStatus('expired');
                    return;
                }

                // All good — increment and redirect
                await incrementClick(code);
                if (!cancelled) {
                    setStatus('redirecting');
                    window.location.href = link.originalUrl;
                }
            } catch (err) {
                console.error('Redirect error:', err);
                if (!cancelled) {
                    navigate('/', { replace: true });
                }
            }
        }

        handleRedirect();

        return () => { cancelled = true; };
    }, [code, navigate]);

    if (status === 'disabled') {
        return (
            <div className="redirect-page">
                <div className="status-card status-disabled">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    <h2>Link Inactive</h2>
                    <p>This short link has been disabled by its owner.</p>
                    <button className="btn-back" onClick={() => navigate('/', { replace: true })}>
                        ← Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'expired') {
        return (
            <div className="redirect-page">
                <div className="status-card status-expired">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <h2>Link Expired</h2>
                    <p>This short link has reached its maximum click limit and is no longer active.</p>
                    <button className="btn-back" onClick={() => navigate('/', { replace: true })}>
                        ← Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="redirect-page">
            <div className="redirect-spinner"></div>
            <p>Redirecting...</p>
        </div>
    );
}
