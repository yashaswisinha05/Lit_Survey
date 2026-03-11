import React, { useState, useEffect } from 'react'
import { X, Link, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { fetchArxivMetadata, detectSource } from '../lib/arxiv'

export default function AddPaperModal({ tags, onClose, onSubmit }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [authors, setAuthors] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [fetchStatus, setFetchStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [submitting, setSubmitting] = useState(false)

  // Auto-fetch when an arXiv URL is pasted
  useEffect(() => {
    if (!url) return
    const source = detectSource(url)
    if (source === 'arxiv') {
      setFetchStatus('loading')
      fetchArxivMetadata(url).then((data) => {
        if (data) {
          setTitle(data.title)
          setAbstract(data.abstract)
          setAuthors(data.authors)
          setFetchStatus('success')
        } else {
          setFetchStatus('error')
        }
      })
    }
  }, [url])

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = async () => {
    if (!url || !title) return
    setSubmitting(true)
    await onSubmit({
      url,
      title,
      abstract,
      authors,
      source: detectSource(url),
      tag_ids: selectedTags,
    })
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Paper</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Paper URL *</label>
            <input
              className="form-input"
              type="url"
              placeholder="https://arxiv.org/abs/2301.12345"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="form-hint">
              Supports arXiv, GitHub, or any URL. ArXiv links auto-fill details!
            </p>
          </div>

          {fetchStatus && (
            <div className={`fetch-status ${fetchStatus}`}>
              {fetchStatus === 'loading' && <><Loader size={14} className="spinner" /> Fetching paper details from arXiv...</>}
              {fetchStatus === 'success' && <><CheckCircle size={14} /> Paper details fetched successfully!</>}
              {fetchStatus === 'error' && <><AlertCircle size={14} /> Could not fetch details. Fill in manually.</>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              type="text"
              placeholder="Paper title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Authors</label>
            <input
              className="form-input"
              type="text"
              placeholder="Author 1, Author 2, ..."
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Abstract</label>
            <textarea
              className="form-textarea"
              placeholder="Paper abstract or description..."
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tag-selector">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  className={`tag-chip ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color,
                  }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!url || !title || submitting}
          >
            {submitting ? 'Adding...' : 'Add Paper'}
          </button>
        </div>
      </div>
    </div>
  )
}
