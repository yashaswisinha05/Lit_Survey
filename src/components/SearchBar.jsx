import React, { useState } from 'react'
import { Search, Sparkles, Type } from 'lucide-react'

export default function SearchBar({ onSearch, isSearching }) {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('keyword') // 'keyword' or 'semantic'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim(), mode)
    } else {
      onSearch('', mode) // clear search
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder={
              mode === 'semantic'
                ? 'Search by idea... e.g. "robot learning from human demonstrations"'
                : 'Search by title or keyword...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </form>

      <div className="search-mode-toggle">
        <button
          className={`search-mode-btn ${mode === 'keyword' ? 'active' : ''}`}
          onClick={() => setMode('keyword')}
        >
          <Type size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Keyword
        </button>
        <button
          className={`search-mode-btn ${mode === 'semantic' ? 'active' : ''}`}
          onClick={() => setMode('semantic')}
        >
          <Sparkles size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Idea Search (AI)
        </button>
      </div>

      {isSearching && (
        <div className="search-loading">
          <div className="spinner" />
          {mode === 'semantic' ? 'Generating embedding & searching...' : 'Searching...'}
        </div>
      )}
    </div>
  )
}
