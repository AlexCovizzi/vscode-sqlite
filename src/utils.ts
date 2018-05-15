export function sanitizeStringForHtml(s: string): string {
    s = s.replace('&', '&amp;');
    s = s.replace('/', '&#x2F;');
    s = s.replace(/<(\w+)>/, '&lt;$1&gt;');
    return s;
}