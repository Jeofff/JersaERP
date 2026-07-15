import React from 'react';
import { LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const fmt = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 });
export const fmtDec = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_COLORS = {
  Active: { bg: 'var(--accent-soft)', fg: '#15803D' },
  'On Leave': { bg: 'var(--warning-soft)', fg: '#B45309' },
  Inactive: { bg: '#F1F5F9', fg: 'var(--text-muted)' },
  Draft: { bg: '#F1F5F9', fg: 'var(--text-muted)' },
  Processing: { bg: 'var(--warning-soft)', fg: '#B45309' },
  Completed: { bg: 'var(--primary-soft)', fg: 'var(--primary-dark)' },
  Released: { bg: 'var(--accent-soft)', fg: '#15803D' },
};

export function StatusPill({ value }) {
  const s = STATUS_COLORS[value] || { bg: '#F1F5F9', fg: 'var(--text-muted)' };
  return <span className="pill" style={{ background: s.bg, color: s.fg }}>{value}</span>;
}

export function Sidebar({ brand, navItems, activeKey, onSelect }) {
  const { user, logout } = useAuth();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="glyph">₱</div>
        <span>{brand}</span>
      </div>
      <div className="role-tag">{user?.role} console</div>
      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={'navitem' + (activeKey === item.key ? ' active' : '')}
              onClick={() => onSelect(item.key)}
            >
              <Icon size={16} /> {item.label}
            </button>
          );
        })}
      </nav>
      <div className="logout">
        <button className="navitem" onClick={logout}>
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}

export function Topbar({ search, onSearch, onSearchFocus }) {
  const { user } = useAuth();
  const initials = (user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={15} color="var(--text-muted)" />
        <input
          placeholder="Search employees…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={onSearchFocus}
        />
      </div>
      <div className="topbar-right">
        <div className="avatar">{initials}</div>
        <div className="user-meta">
          <div className="name">{user?.name}</div>
          <div className="role">{user?.email}</div>
        </div>
      </div>
    </header>
  );
}

export function PageHeader({ title, desc, action }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function KPI({ label, value, icon: Icon, tint, sub }) {
  return (
    <div className="card kpi">
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon" style={{ background: tint + '1A', color: tint }}>
          <Icon size={15} />
        </div>
      </div>
      <div className="kpi-value tabular">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

export function RoadmapPage({ title, desc, items, icon: Icon }) {
  return (
    <div>
      <PageHeader title={title} desc={desc} />
      <div className="card roadmap">
        <div className="tag"><Icon size={18} /></div>
        <h3>Next on the roadmap</h3>
        <p>This module isn't wired up yet. Here's what it will track once it ships.</p>
        <div className="chips">
          {items.map((it) => <span key={it} className="chip">{it}</span>)}
        </div>
      </div>
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}
