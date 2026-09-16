import { escapeHtml } from "./layout.js";

export function renderAdminLayout({ title, userEmail, bodyHtml, notice }) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<title>${escapeHtml(title)} · Admin</title>
<link rel="stylesheet" href="/style.css?v=7">
<style>
  .admin-shell{max-width:820px;margin:0 auto;padding:32px 24px 80px;}
  .admin-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;flex-wrap:wrap;gap:12px;}
  .admin-top a.back{color:var(--text-muted);font-size:.85rem;}
  .admin-user{color:var(--text-muted);font-size:.82rem;}
  .admin-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:28px;margin-bottom:20px;}
  .admin-card h1, .admin-card h2{margin-bottom:6px;}
  .admin-card .hint{color:var(--text-muted);font-size:.85rem;margin-bottom:22px;}
  .admin-field{margin-bottom:18px;}
  .admin-field label{display:block;font-size:.82rem;color:var(--text-muted);margin-bottom:6px;font-weight:600;}
  .admin-field input, .admin-field textarea{
    width:100%;background:var(--bg);border:1px solid var(--border);border-radius:10px;
    padding:12px 14px;color:var(--text);font-family:inherit;font-size:.95rem;
  }
  .admin-field input:focus, .admin-field textarea:focus{outline:none;border-color:var(--accent);}
  .admin-fieldset{border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;}
  .admin-fieldset legend{padding:0 8px;color:var(--text-muted);font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;}
  .admin-list a{
    display:block;padding:14px 18px;background:var(--bg-card);border:1px solid var(--border);
    border-radius:10px;margin-bottom:10px;color:var(--text);font-weight:600;
  }
  .admin-list a:hover{border-color:var(--accent);}
  .admin-notice{
    background:rgba(34,211,166,0.1);border:1px solid rgba(34,211,166,0.35);color:var(--accent-2);
    padding:12px 16px;border-radius:10px;margin-bottom:20px;font-size:.9rem;font-weight:600;
  }
</style>
</head>
<body style="background:var(--bg);">
<div class="admin-shell">
  <div class="admin-top">
    <a href="/admin" class="back">← Admin Panel</a>
    <span class="admin-user">${userEmail ? "👤 " + escapeHtml(userEmail) : ""}</span>
  </div>
  ${notice ? `<div class="admin-notice">${escapeHtml(notice)}</div>` : ""}
  ${bodyHtml}
</div>
</body>
</html>`;
}
