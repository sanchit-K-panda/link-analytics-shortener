import { sql } from './neonClient';

// ===== USER AUTH (localStorage) =====
const USERS_KEY = 'linksnip_users';
const SESSION_KEY = 'linksnip_session';

export function getUsers() {
    try {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(username, password) {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        return { success: false, error: 'Username already exists' };
    }
    users.push({ username, password, createdAt: new Date().toISOString() });
    saveUsers(users);
    setSession(username);
    return { success: true };
}

export function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return { success: false, error: 'Invalid username or password' };
    }
    setSession(username);
    return { success: true };
}

export function setSession(username) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, loggedInAt: new Date().toISOString() }));
}

export function getSession() {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

// ===== LINKS (Neon PostgreSQL) =====

function mapRow(row) {
    return {
        id: row.id,
        originalUrl: row.original_url,
        shortCode: row.short_code,
        clicks: row.clicks,
        maxClicks: row.max_clicks,
        enabled: row.enabled,
        createdAt: row.created_at,
        lastAccessedAt: row.last_accessed_at,
        owner: row.owner,
    };
}

export async function getLinks(username) {
    try {
        const rows = await sql`
            SELECT * FROM links WHERE owner = ${username} ORDER BY created_at ASC
        `;
        return rows.map(mapRow);
    } catch (err) {
        console.error('getLinks error:', err);
        return [];
    }
}

export async function addLink(originalUrl, shortCode, username, maxClicks = null) {
    try {
        await sql`
            INSERT INTO links (original_url, short_code, clicks, max_clicks, enabled, owner, last_accessed_at)
            VALUES (${originalUrl}, ${shortCode}, 0, ${maxClicks}, true, ${username}, null)
        `;
    } catch (err) {
        console.error('addLink error:', err);
    }
    return getLinks(username);
}

export async function incrementClick(shortCode) {
    try {
        await sql`
            UPDATE links
            SET clicks = clicks + 1, last_accessed_at = NOW()
            WHERE short_code = ${shortCode}
        `;
    } catch (err) {
        console.error('incrementClick error:', err);
    }
}

export async function findLinkByCode(shortCode) {
    try {
        const rows = await sql`
            SELECT * FROM links WHERE short_code = ${shortCode} LIMIT 1
        `;
        if (rows.length === 0) return null;
        return mapRow(rows[0]);
    } catch (err) {
        console.error('findLinkByCode error:', err);
        return null;
    }
}

export async function updateLinkUrl(shortCode, newUrl, username) {
    try {
        await sql`
            UPDATE links SET original_url = ${newUrl}
            WHERE short_code = ${shortCode} AND owner = ${username}
        `;
    } catch (err) {
        console.error('updateLinkUrl error:', err);
    }
    return getLinks(username);
}

export async function toggleLinkEnabled(shortCode, username) {
    try {
        await sql`
            UPDATE links SET enabled = NOT enabled
            WHERE short_code = ${shortCode} AND owner = ${username}
        `;
    } catch (err) {
        console.error('toggleLinkEnabled error:', err);
    }
    return getLinks(username);
}

export function generateShortCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
