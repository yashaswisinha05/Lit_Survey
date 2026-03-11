import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from './context/AuthContext'
import { supabase, isDemoMode } from './lib/supabase'
import { generateEmbedding } from './lib/embeddings'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import SearchBar from './components/SearchBar'
import PaperCard from './components/PaperCard'
import AddPaperModal from './components/AddPaperModal'
import LoginPage from './components/LoginPage'
import { FileText } from 'lucide-react'

// ===========================================================
// Demo data for when Supabase is not configured
// ===========================================================
const DEMO_TAGS = [
  { id: 1, name: 'VLA', color: '#8b5cf6' },
  { id: 2, name: 'Diffusion', color: '#ec4899' },
  { id: 3, name: 'Robotics', color: '#06b6d4' },
  { id: 4, name: 'NLP', color: '#f59e0b' },
  { id: 5, name: 'Computer Vision', color: '#10b981' },
  { id: 6, name: 'Reinforcement Learning', color: '#ef4444' },
  { id: 7, name: 'Transformers', color: '#6366f1' },
  { id: 8, name: 'Generative Models', color: '#14b8a6' },
]

const DEMO_PAPERS = [
  {
    id: 1,
    title: 'RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control',
    abstract: 'We study how vision-language models trained on Internet-scale data can be incorporated directly into end-to-end robotic control to boost generalization and enable emergent semantic reasoning. We develop a family of action models, RT-2, that learns from both web and robotics data and outputs tokenized actions.',
    authors: 'Anthony Brohan, Noah Brown, Justice Carbajal, et al.',
    url: 'https://arxiv.org/abs/2307.15818',
    source: 'arxiv',
    tag_ids: [1, 3, 5],
    posted_by_name: 'Demo Researcher',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    title: 'Denoising Diffusion Probabilistic Models',
    abstract: 'We present high quality image synthesis results using diffusion probabilistic models, a class of latent variable models inspired by considerations from nonequilibrium thermodynamics. Our best results are obtained by training on a weighted variational bound designed according to a novel connection between diffusion probabilistic models and denoising score matching with Langevin dynamics.',
    authors: 'Jonathan Ho, Ajay Jain, Pieter Abbeel',
    url: 'https://arxiv.org/abs/2006.11239',
    source: 'arxiv',
    tag_ids: [2, 8],
    posted_by_name: 'Demo Researcher',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    title: 'Attention Is All You Need',
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, et al.',
    url: 'https://arxiv.org/abs/1706.03762',
    source: 'arxiv',
    tag_ids: [4, 7],
    posted_by_name: 'Demo Researcher',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 4,
    title: 'Octo: An Open-Source Generalist Robot Policy',
    abstract: 'Large policies pretrained on diverse robot datasets have the potential to transform robotic learning: they can be used for data-efficient adaptation to new environments, new robots, and new tasks. Octo is a transformer-based policy trained on 800K robot trajectories from the Open X-Embodiment dataset, the largest robot manipulation dataset.',
    authors: 'Octo Model Team, Dibya Ghosh, Homer Walke, et al.',
    url: 'https://arxiv.org/abs/2405.12213',
    source: 'arxiv',
    tag_ids: [1, 3, 6, 7],
    posted_by_name: 'Demo Researcher',
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 5,
    title: 'Stable Diffusion 3: Scaling Rectified Flow Transformers for High-Resolution Image Synthesis',
    abstract: 'We present Stable Diffusion 3, a Multimodal Diffusion Transformer (MMDiT) that uses rectified flow for high-quality image synthesis. Our model uses separate sets of weights for text and image modalities within the transformer architecture to improve text understanding and spelling capabilities.',
    authors: 'Patrick Esser, Sumith Kulal, Andreas Blattmann, et al.',
    url: 'https://arxiv.org/abs/2403.03206',
    source: 'arxiv',
    tag_ids: [2, 5, 7, 8],
    posted_by_name: 'Demo Researcher',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 6,
    title: 'LeRobot: Democratizing AI for Robotics',
    abstract: 'LeRobot aims to provide models, datasets, and tools for real-world robotics in PyTorch. The goal is to lower the barrier to entry to robotics so that everyone can contribute and benefit from sharing datasets and pre-trained models.',
    authors: 'Cadene et al., Hugging Face',
    url: 'https://github.com/huggingface/lerobot',
    source: 'github',
    tag_ids: [1, 3, 6],
    posted_by_name: 'Demo Researcher',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
]

// ===========================================================
// App Component
// ===========================================================
export default function App() {
  const { user, loading: authLoading } = useAuth()
  const [papers, setPapers] = useState(isDemoMode ? DEMO_PAPERS : [])
  const [tags, setTags] = useState(isDemoMode ? DEMO_TAGS : [])
  const [activeTag, setActiveTag] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [showSimilarity, setShowSimilarity] = useState(false)

  // Load data from Supabase (when configured)
  useEffect(() => {
    if (isDemoMode || !user) return
    loadTags()
    loadPapers()
  }, [user])

  async function loadTags() {
    const { data } = await supabase.from('tags').select('*').order('name')
    if (data) setTags(data)
  }

  async function loadPapers() {
    const { data } = await supabase
      .from('papers')
      .select('*, paper_tags(tag_id), profiles(display_name)')
      .order('created_at', { ascending: false })

    if (data) {
      const mapped = data.map(p => ({
        ...p,
        tag_ids: p.paper_tags?.map(pt => pt.tag_id) || [],
        posted_by_name: p.profiles?.display_name || 'Unknown',
      }))
      setPapers(mapped)
    }
  }

  // Handle adding a paper
  async function handleAddPaper(paper) {
    if (isDemoMode) {
      // Demo mode: just add to local state
      const newPaper = {
        ...paper,
        id: Date.now(),
        posted_by_name: 'Demo Researcher',
        created_at: new Date().toISOString(),
      }
      setPapers(prev => [newPaper, ...prev])
      return
    }

    // Real mode: save to Supabase
    const { data, error } = await supabase.from('papers').insert({
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors,
      url: paper.url,
      source: paper.source,
      posted_by: user.id,
    }).select().single()

    if (error || !data) return

    // Save tags
    if (paper.tag_ids?.length) {
      await supabase.from('paper_tags').insert(
        paper.tag_ids.map(tid => ({ paper_id: data.id, tag_id: tid }))
      )
    }

    // Generate and store embedding for semantic search
    if (paper.abstract) {
      const embedding = await generateEmbedding(paper.abstract)
      if (embedding) {
        await supabase.from('papers').update({ embedding }).eq('id', data.id)
      }
    }

    loadPapers()
  }

  // Handle deleting a paper
  async function handleDeletePaper(paperId) {
    if (isDemoMode) {
      setPapers(prev => prev.filter(p => p.id !== paperId))
      return
    }
    await supabase.from('papers').delete().eq('id', paperId)
    loadPapers()
  }

  // Handle search
  async function handleSearch(query, mode) {
    if (!query) {
      setSearchResults(null)
      setShowSimilarity(false)
      return
    }

    setIsSearching(true)

    if (mode === 'semantic') {
      setShowSimilarity(true)
      if (isDemoMode) {
        // Demo: fake semantic search with simple keyword matching as fallback
        await new Promise(r => setTimeout(r, 800))
        const q = query.toLowerCase()
        const results = papers
          .map(p => ({
            ...p,
            similarity: (
              (p.title.toLowerCase().includes(q) ? 0.4 : 0) +
              (p.abstract.toLowerCase().includes(q) ? 0.3 : 0) +
              Math.random() * 0.3
            ),
          }))
          .filter(p => p.similarity > 0.2)
          .sort((a, b) => b.similarity - a.similarity)
        setSearchResults(results)
      } else {
        // Real semantic search via embeddings
        const embedding = await generateEmbedding(query)
        if (embedding) {
          const { data } = await supabase.rpc('match_papers', {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: 20,
          })
          if (data) {
            // Enrich with tag data
            const enriched = data.map(p => {
              const original = papers.find(op => op.id === p.id)
              return {
                ...p,
                tag_ids: original?.tag_ids || [],
                posted_by_name: original?.posted_by_name || 'Unknown',
              }
            })
            setSearchResults(enriched)
          }
        }
      }
    } else {
      // Keyword search
      setShowSimilarity(false)
      const q = query.toLowerCase()
      const results = papers.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.abstract?.toLowerCase().includes(q) ||
          p.authors?.toLowerCase().includes(q)
      )
      setSearchResults(results)
    }

    setIsSearching(false)
  }

  // Compute paper counts per tag
  const paperCounts = useMemo(() => {
    const counts = { total: papers.length }
    tags.forEach(t => {
      counts[t.id] = papers.filter(p => p.tag_ids?.includes(t.id)).length
    })
    return counts
  }, [papers, tags])

  // Filter papers by active tag
  const displayPapers = useMemo(() => {
    const source = searchResults ?? papers
    if (!activeTag) return source
    return source.filter(p => p.tag_ids?.includes(activeTag))
  }, [papers, searchResults, activeTag])

  // Show loading
  if (authLoading) {
    return (
      <div className="login-page">
        <div className="search-loading" style={{ fontSize: '1rem' }}>
          <div className="spinner" style={{ width: 24, height: 24 }} />
          Loading...
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginPage />
  }

  return (
    <>
      <Navbar onAddPaper={() => setShowAddModal(true)} />
      <div className="app-layout">
        <Sidebar
          tags={tags}
          activeTag={activeTag}
          onTagSelect={setActiveTag}
          paperCounts={paperCounts}
        />
        <main className="main-content">
          <div className="page-container">
            <div className="feed-header">
              <h1>
                {activeTag
                  ? tags.find(t => t.id === activeTag)?.name + ' Papers'
                  : searchResults
                    ? 'Search Results'
                    : 'All Papers'}
              </h1>
            </div>

            <div style={{ marginBottom: 24 }}>
              <SearchBar onSearch={handleSearch} isSearching={isSearching} />
            </div>

            <div className="feed-stats">
              <div className="stat-item">
                <div className="stat-value">{displayPapers.length}</div>
                <div className="stat-label">Papers</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{tags.length}</div>
                <div className="stat-label">Tags</div>
              </div>
            </div>

            {displayPapers.length === 0 ? (
              <div className="empty-state fade-in">
                <div className="empty-icon">
                  <FileText size={48} />
                </div>
                <h3>No papers yet</h3>
                <p>
                  {searchResults
                    ? 'No papers match your search. Try different keywords or switch to Idea Search.'
                    : 'Click "Add Paper" to get started. Paste an arXiv link and we\'ll do the rest!'}
                </p>
              </div>
            ) : (
              displayPapers.map(paper => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  tags={tags}
                  onTagClick={setActiveTag}
                  onDelete={handleDeletePaper}
                  showSimilarity={showSimilarity}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {showAddModal && (
        <AddPaperModal
          tags={tags}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPaper}
        />
      )}
    </>
  )
}
