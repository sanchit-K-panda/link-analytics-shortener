const STORAGE_KEY = 'linksnip_links';
const USERS_KEY = 'linksnip_users';
const SESSION_KEY = 'linksnip_session';

// ===== USER AUTH =====
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

// ===== LINKS =====
function getUserLinksKey(username) {
    return `${STORAGE_KEY}_${username}`;
}

export function getLinks(username) {
    try {
        const key = username ? getUserLinksKey(username) : STORAGE_KEY;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveLinks(links, username) {
    const key = username ? getUserLinksKey(username) : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(links));
}

export function addLink(originalUrl, shortCode, username, maxClicks = null) {
    const links = getLinks(username);
    links.push({
        id: shortCode,
        originalUrl,
        shortCode,
        clicks: 0,
        maxClicks: maxClicks,
        enabled: true,
        createdAt: new Date().toISOString(),
        lastAccessedAt: null,
        owner: username || null,
    });
    saveLinks(links, username);
    // Also save to global lookup for redirect
    saveGlobalLookup(shortCode, username);
    return links;
}

// Global lookup: shortCode -> username (so redirect can find the link)
const GLOBAL_LOOKUP_KEY = 'linksnip_global';

function getGlobalLookup() {
    try {
        const data = localStorage.getItem(GLOBAL_LOOKUP_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

function saveGlobalLookup(shortCode, username) {
    const lookup = getGlobalLookup();
    lookup[shortCode] = username || '__anonymous__';
    localStorage.setItem(GLOBAL_LOOKUP_KEY, JSON.stringify(lookup));
}

export function incrementClick(shortCode) {
    // Find the link via global lookup
    const lookup = getGlobalLookup();
    const username = lookup[shortCode];
    const key = username && username !== '__anonymous__' ? username : null;
    const links = getLinks(key);
    const link = links.find((l) => l.shortCode === shortCode);
    if (link) {
        link.clicks += 1;
        link.lastAccessedAt = new Date().toISOString();
        saveLinks(links, key);
    }
    return link;
}

export function findLinkByCode(shortCode) {
    const lookup = getGlobalLookup();
    const username = lookup[shortCode];
    if (!username) {
        // Fallback: check old anonymous links
        const links = getLinks(null);
        return links.find((l) => l.shortCode === shortCode) || null;
    }
    const key = username !== '__anonymous__' ? username : null;
    const links = getLinks(key);
    return links.find((l) => l.shortCode === shortCode) || null;
}

export function updateLinkUrl(shortCode, newUrl, username) {
    const links = getLinks(username);
    const link = links.find((l) => l.shortCode === shortCode);
    if (link) {
        link.originalUrl = newUrl;
        saveLinks(links, username);
    }
    return links;
}

export function toggleLinkEnabled(shortCode, username) {
    const links = getLinks(username);
    const link = links.find((l) => l.shortCode === shortCode);
    if (link) {
        link.enabled = !link.enabled;
        saveLinks(links, username);
    }
    return links;
}

export function generateShortCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
