import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findLinkByCode, incrementClick } from '../utils/storage';

export default function RedirectHandler() {
    const { code } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const link = findLinkByCode(code);
        if (link) {
            incrementClick(code);
            window.location.href = link.originalUrl;
        } else {
            navigate('/', { replace: true });
        }
    }, [code, navigate]);

    return (
        <div className="redirect-page">
            <div className="redirect-spinner"></div>
            <p>Redirecting...</p>
        </div>
    );
}
