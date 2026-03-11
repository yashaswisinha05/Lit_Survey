import React, { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp, Trash2, Zap } from 'lucide-react'

export default function PaperCard({ paper, tags, onTagClick, onDelete, showSimilarity }) {
  const [expanded, setExpanded] = useState(false)

  const sourceBadgeClass = {
    arxiv: 'arxiv',
    github: 'github',
    'github-pages': 'github',
  }[paper.source] || 'other'

  const paperTags = tags.filter(t => paper.tag_ids?.includes(t.id))

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="paper-card slide-up">
      <div className="paper-card-header">
        <h3 className="paper-title">
          <a href={paper.url} target="_blank" rel="noopener noreferrer">
            {paper.title}
            <ExternalLink size={14} style={{ marginLeft: 6, verticalAlign: 'middle', opacity: 0.5 }} />
          </a>
        </h3>
        <span className={`paper-source-badge ${sourceBadgeClass}`}>
          {paper.source}
        </span>
      </div>

      {paper.authors && (
        <p className="paper-authors">{paper.authors}</p>
      )}

      {paper.abstract && (
        <>
          <p className={`paper-abstract ${expanded ? 'expanded' : ''}`}>
            {paper.abstract}
          </p>
          {paper.abstract.length > 200 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setExpanded(!expanded)}
              style={{ marginBottom: 10, padding: '2px 8px', fontSize: '0.75rem' }}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </>
      )}

      <div className="paper-footer">
        <div className="paper-tags">
          {paperTags.map(tag => (
            <button
              key={tag.id}
              className="tag-chip"
              style={{
                backgroundColor: tag.color + '20',
                color: tag.color,
              }}
              onClick={() => onTagClick(tag.id)}
            >
              {tag.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showSimilarity && paper.similarity != null && (
            <span className="paper-similarity">
              <Zap size={13} />
              {(paper.similarity * 100).toFixed(0)}% match
            </span>
          )}
          <span className="paper-meta">
            {paper.posted_by_name && <span>by {paper.posted_by_name}</span>}
            <span>{timeAgo(paper.created_at)}</span>
          </span>
          {onDelete && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onDelete(paper.id)}
              title="Delete paper"
              style={{ color: 'var(--text-muted)' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
