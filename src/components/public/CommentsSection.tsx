import { useState, type FormEvent } from 'react';
import { MessageSquare, Send, User, ChevronDown, ChevronUp } from 'lucide-react';
import type { Comment } from '../../types';

interface CommentsSectionProps {
  medicationId: string;
  comments: Comment[];
  onAddComment: (medicationId: string, author: string, content: string) => void;
}

export function CommentsSection({ medicationId, comments, onAddComment }: CommentsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setIsSubmitting(true);
    onAddComment(medicationId, author.trim(), content.trim());
    setAuthor('');
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
      {/* Collapsible toggle bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem 0',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <MessageSquare size={16} color="var(--primary)" />
          <span>Notas Familiares</span>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem' }}>
            {comments.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <span>{isOpen ? 'Ocultar' : 'Ver notas'}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="animate-fade-in" style={{ marginTop: '1rem' }}>
          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {comments.length === 0 ? (
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.875rem'
              }}>
                No hay observaciones registradas para este medicamento.
              </div>
            ) : (
              comments.map(comment => (
                <div
                  key={comment.id}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <User size={14} color="var(--text-muted)" />
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {comment.author_name}
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(comment.created_at).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* New Comment Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Familiar o Cuidador</label>
                <input
                  type="text"
                  placeholder="Ej. Alejandro, Kevin..."
                  className="form-input"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  required
                  disabled={isSubmitting}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Observación o Notificación</label>
              <textarea
                placeholder="Ej. Ya se le administró después de desayunar..."
                className="form-textarea"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={2}
                disabled={isSubmitting}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              <Send size={14} />
              <span>Guardar nota familiar</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
