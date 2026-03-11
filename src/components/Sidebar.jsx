import React from 'react'
import { LayoutGrid } from 'lucide-react'

export default function Sidebar({ tags, activeTag, onTagSelect, paperCounts }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Categories</div>
      
      <button
        className={`sidebar-item ${activeTag === null ? 'active' : ''}`}
        onClick={() => onTagSelect(null)}
      >
        <LayoutGrid size={16} />
        All Papers
        <span className="tag-count">{paperCounts?.total ?? 0}</span>
      </button>

      {tags.map(tag => (
        <button
          key={tag.id}
          className={`sidebar-item ${activeTag === tag.id ? 'active' : ''}`}
          onClick={() => onTagSelect(tag.id)}
        >
          <span className="tag-dot" style={{ backgroundColor: tag.color }} />
          {tag.name}
          <span className="tag-count">{paperCounts?.[tag.id] ?? 0}</span>
        </button>
      ))}
    </aside>
  )
}
