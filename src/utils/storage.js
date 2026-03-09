const STORAGE_KEY = 'linksnip_links';

export function getLinks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveLinks(links) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function addLink(originalUrl, shortCode) {
    const links = getLinks();
    links.push({
        id: shortCode,
        originalUrl,
        shortCode,
        clicks: 0,
        createdAt: new Date().toISOString(),
    });
    saveLinks(links);
    return links;
}

export function incrementClick(shortCode) {
    const links = getLinks();
    const link = links.find((l) => l.shortCode === shortCode);
    if (link) {
        link.clicks += 1;
        saveLinks(links);
    }
    return link;
}

export function findLinkByCode(shortCode) {
    const links = getLinks();
    return links.find((l) => l.shortCode === shortCode);
}

export function generateShortCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    const links = getLinks();
    if (links.find((l) => l.shortCode === result)) {
        return generateShortCode();
    }
    return result;
}
