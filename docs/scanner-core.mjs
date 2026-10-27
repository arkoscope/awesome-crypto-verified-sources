// Exact matches only. This module never fetches a submitted URL.
export const projectSlug = p => p.project.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function parsed(value) {
  try {
    if (/[\\\s\u0000-\u001f]/.test(value)) return null;
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : 'https://' + value);
    if (u.protocol !== 'https:' || u.username || u.password || u.port) return null;
    return u;
  } catch { return null; }
}
function socialHandle(u) {
  if (!u) return null;
  if (!['x.com','www.x.com','twitter.com','www.twitter.com'].includes(u.hostname)) return null;
  const m = u.pathname.match(/^\/([a-zA-Z0-9_]{1,15})(?:\/(?:status\/\d+|with_replies|media))?\/?$/);
  return m ? m[1].toLowerCase() : null;
}
export function matchSource(input, projects) {
  const raw = String(input).trim();
  if (!raw || raw.length > 2048) return {status:'unknown'};
  const q = raw.replace(/^\$/, '').toLowerCase();
  const named = projects.filter(p => [p.project.toLowerCase(),p.ticker.toLowerCase(),projectSlug(p)].includes(q));
  if (named.length === 1) return {status:'project', project:named[0]};
  if (named.length > 1) return {status:'ambiguous'};
  const u = parsed(raw);
  if (!u) return {status:'unknown'};
  const handle = socialHandle(u);
  if (handle) {
    const p = projects.find(p => socialHandle(parsed(p.x)) === handle);
    if (!p) return {status:'unknown'};
    return {status:p.xEvidence?.status === 'linked-by-official-site' ? 'verified' : 'reference',project:p,matchedURL:p.x,kind:'social'};
  }
  // A known hostname does not certify arbitrary paths, redirects or query strings.
  if (u.search || u.hash) return {status:'unknown'};
  const key = v => v.origin + v.pathname.replace(/\/+$/, '');
  for (const p of projects) {
    for (const source of [p.website,...(p.resources || [])]) {
      const known = parsed(source);
      if (known && key(u) === key(known)) return {
        status:source === p.website && p.websiteEvidence?.status === 'public-page-read' ? 'verified' : 'reference',
        project:p,matchedURL:source,kind:'web'
      };
    }
  }
  return {status:'unknown'};
}
