import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_COLS = [
  { key: 'TODO', label: 'To do', color: 'var(--text2)' },
  { key: 'IN_PROGRESS', label: 'In progress', color: 'var(--blue)' },
  { key: 'DONE', label: 'Done', color: 'var(--green)' },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const priorityColor = { HIGH: 'var(--red)', MEDIUM: 'var(--amber)', LOW: 'var(--text3)' };

function TaskModal({ task, project, onClose, onSave }) {
  const isNew = !task;
  const [form, setForm] = useState(task ? {
    title: task.title, description: task.description || '', status: task.status,
    priority: task.priority, dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
    assigneeId: task.assigneeId || '',
  } : { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, assigneeId: form.assigneeId || null, dueDate: form.dueDate || null };
      if (isNew) {
        await api.post(`/tasks/project/${project.id}`, payload);
      } else {
        await api.put(`/tasks/${task.id}`, payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to save task');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-title">{isNew ? 'New task' : 'Edit task'}</div>
        <form onSubmit={save}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {STATUS_COLS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select value={form.assigneeId} onChange={e => setForm(p => ({ ...p, assigneeId: e.target.value }))}>
                <option value="">Unassigned</option>
                {project.members?.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : isNew ? 'Create task' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberModal({ project, onClose, onSave }) {
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const add = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post(`/projects/${project.id}/members`, { email });
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally { setSaving(false); }
  };

  const remove = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${project.id}/members/${userId}`);
      onSave();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Manage members</div>
        <div style={{ marginBottom: 20 }}>
          {project.members?.map(m => (
            <div key={m.user.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--accent2)', fontWeight: 600 }}>
                {m.user.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{m.user.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.user.email}</div>
              </div>
              <span className={`badge badge-${m.user.role.toLowerCase()}`}>{m.user.role}</span>
              <button className="btn btn-sm btn-danger" style={{ border: 'none' }} onClick={() => remove(m.user.id)}>✕</button>
            </div>
          ))}
        </div>
        <form onSubmit={add}>
          <label className="form-label">Add member by email</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="email" placeholder="member@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ whiteSpace: 'nowrap' }}>{saving ? '...' : 'Add'}</button>
          </div>
          {error && <div className="error-msg" style={{ marginTop: 8 }}>{error}</div>}
        </form>
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null);
  const [memberModal, setMemberModal] = useState(false);
  const [filter, setFilter] = useState({ priority: '', assigneeId: '' });

  const loadProject = () => api.get(`/projects/${id}`).then(r => setProject(r.data));
  const loadTasks = () => {
    const params = new URLSearchParams();
    if (filter.priority) params.append('priority', filter.priority);
    if (filter.assigneeId) params.append('assigneeId', filter.assigneeId);
    return api.get(`/tasks/project/${id}?${params}`).then(r => setTasks(r.data));
  };

  const load = () => Promise.all([loadProject(), loadTasks()]).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id, filter]);

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    setTasks(t => t.filter(x => x.id !== taskId));
  };

  const quickStatus = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    setTasks(t => t.map(x => x.id === taskId ? { ...x, status } : x));
  };

  if (loading) return <div style={{ color: 'var(--text2)' }}>Loading...</div>;
  if (!project) return <div style={{ color: 'var(--red)' }}>Project not found.</div>;

  const tasksByStatus = Object.fromEntries(STATUS_COLS.map(c => [c.key, tasks.filter(t => t.status === c.key)]));
  const overdue = t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>← Back</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{project.name}</h1>
          {project.description && <p style={{ color: 'var(--text2)', fontSize: 14 }}>{project.description}</p>}
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: 'var(--text3)' }}>
            <span>👤 {project.members?.length} members</span>
            <span>✓ {tasks.length} tasks</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {user.role === 'ADMIN' && (
            <button className="btn btn-ghost btn-sm" onClick={() => setMemberModal(true)}>Manage members</button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setTaskModal('new')}>+ Add task</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={filter.priority} onChange={e => setFilter(p => ({ ...p, priority: e.target.value }))}
          style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}>
          <option value="">All priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filter.assigneeId} onChange={e => setFilter(p => ({ ...p, assigneeId: e.target.value }))}
          style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}>
          <option value="">All assignees</option>
          {project.members?.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {STATUS_COLS.map(col => (
          <div key={col.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: col.color }}>{col.label}</span>
              <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>{tasksByStatus[col.key]?.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 60 }}>
              {tasksByStatus[col.key]?.map(task => (
                <div key={task.id} className="card" style={{
                  padding: 14,
                  borderLeft: `3px solid ${priorityColor[task.priority]}`,
                  ...(overdue(task) ? { borderColor: 'var(--red)', background: 'var(--red-bg)' } : {}),
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{task.title}</span>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button className="btn btn-sm" style={{ padding: '2px 7px', fontSize: 12, background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}
                        onClick={() => setTaskModal(task)}>✎</button>
                      {(user.role === 'ADMIN' || task.createdById === user.id) && (
                        <button className="btn btn-sm btn-danger" style={{ padding: '2px 7px', fontSize: 12 }}
                          onClick={() => deleteTask(task.id)}>✕</button>
                      )}
                    </div>
                  </div>
                  {task.description && <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, lineHeight: 1.4 }}>{task.description}</p>}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: 11 }}>{task.priority}</span>
                    {task.assignee && (
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>→ {task.assignee.name}</span>
                    )}
                    {task.dueDate && (
                      <span style={{ fontSize: 11, color: overdue(task) ? 'var(--red)' : 'var(--text3)', marginLeft: 'auto' }}>
                        {overdue(task) ? '⚠ ' : ''}{new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {col.key !== 'DONE' && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                      {col.key === 'TODO' && (
                        <button className="btn btn-sm" style={{ fontSize: 11, padding: '3px 8px', background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid rgba(59,130,246,0.2)' }}
                          onClick={() => quickStatus(task.id, 'IN_PROGRESS')}>Start →</button>
                      )}
                      {col.key === 'IN_PROGRESS' && (
                        <button className="btn btn-sm" style={{ fontSize: 11, padding: '3px 8px', background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)' }}
                          onClick={() => quickStatus(task.id, 'DONE')}>Done ✓</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {taskModal && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          project={project}
          onClose={() => setTaskModal(null)}
          onSave={() => { setTaskModal(null); loadTasks(); }}
        />
      )}
      {memberModal && (
        <MemberModal
          project={project}
          onClose={() => setMemberModal(false)}
          onSave={() => { loadProject(); setMemberModal(false); }}
        />
      )}
    </div>
  );
}
