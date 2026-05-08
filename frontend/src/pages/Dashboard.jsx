import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StatCard = ({ label, value, color }) => (
  <div className="card" style={{ borderTop: `2px solid ${color}` }}>
    <div style={{ fontSize: 32, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</div>
  </div>
);

const priorityColor = { HIGH: 'var(--red)', MEDIUM: 'var(--amber)', LOW: 'var(--text3)' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text2)' }}>Loading dashboard...</div>;

  const { stats, overdue, myTasks } = data;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>
          Good day, {user.name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Here's what's happening across your projects.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total tasks" value={stats.total} color="var(--accent2)" />
        <StatCard label="To do" value={stats.todo} color="var(--text2)" />
        <StatCard label="In progress" value={stats.inProgress} color="var(--blue)" />
        <StatCard label="Done" value={stats.done} color="var(--green)" />
        <StatCard label="Projects" value={stats.projects} color="var(--amber)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Overdue tasks</h2>
            {overdue.length > 0 && (
              <span className="badge badge-high">{overdue.length} overdue</span>
            )}
          </div>
          {overdue.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 14, padding: '12px 0' }}>No overdue tasks. Great work!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {overdue.map(task => (
                <Link key={task.id} to={`/projects/${task.projectId}`} style={{
                  display: 'block', padding: '10px 12px', background: 'var(--red-bg)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.15)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{task.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8, whiteSpace: 'nowrap' }}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{task.project?.name}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>My upcoming tasks</h2>
          {myTasks.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 14, padding: '12px 0' }}>No tasks assigned to you.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myTasks.map(task => (
                <Link key={task.id} to={`/projects/${task.projectId}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor[task.priority], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{task.project?.name}</div>
                  </div>
                  {task.dueDate && (
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
