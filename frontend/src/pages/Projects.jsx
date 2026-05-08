import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const fetch = () => api.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const create = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/projects', form);
      setShowModal(false); setForm({ name: '', description: '' }); fetch();
    } finally { setSaving(false); }
  };

  const del = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this project and all its tasks?')) return;
    await api.delete(`/projects/${id}`);
    setProjects(p => p.filter(x => x.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Projects</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New project</button>
        )}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text2)' }}>Loading...</div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text2)' }}>
          {user.role === 'ADMIN' ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {projects.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`} style={{ display: 'block' }}>
              <div className="card" style={{ height: '100%', transition: 'border-color 0.15s, transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</h3>
                  {user.role === 'ADMIN' && (
                    <button className="btn btn-sm btn-danger" style={{ border: 'none', padding: '3px 8px' }}
                      onClick={e => del(p.id, e)}>✕</button>
                  )}
                </div>
                {p.description && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>{p.description}</p>}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)', marginTop: 'auto' }}>
                  <span>👤 {p._count?.members ?? 0} members</span>
                  <span>✓ {p._count?.tasks ?? 0} tasks</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>by {p.owner?.name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">New project</div>
            <form onSubmit={create}>
              <div className="form-group">
                <label className="form-label">Project name *</label>
                <input placeholder="e.g. Website Redesign" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea rows={3} placeholder="What is this project about?" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
