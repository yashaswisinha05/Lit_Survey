/**
 * Fetch paper metadata from an arXiv URL using the arXiv API.
 * Supports URLs like:
 *   - https://arxiv.org/abs/2301.12345
 *   - https://arxiv.org/pdf/2301.12345
 */
export function extractArxivId(url) {
  const match = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d+\.\d+(?:v\d+)?)/i)
  return match ? match[1] : null
}

export async function fetchArxivMetadata(url) {
  const id = extractArxivId(url)
  if (!id) return null

  try {
    const response = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent('https://export.arxiv.org/api/query?id_list=' + id)}`
    )
    const text = await response.text()
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'text/xml')

    const entry = xml.querySelector('entry')
    if (!entry) return null

    const title = entry.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() || ''
    const abstract = entry.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim() || ''
    const authors = Array.from(entry.querySelectorAll('author name'))
      .map(n => n.textContent)
      .join(', ')

    return { title, abstract, authors, source: 'arxiv' }
  } catch (err) {
    console.error('Failed to fetch arXiv metadata:', err)
    return null
  }
}

/**
 * Detect source type from URL
 */
export function detectSource(url) {
  if (/arxiv\.org/i.test(url)) return 'arxiv'
  if (/github\.com/i.test(url)) return 'github'
  if (/github\.io/i.test(url)) return 'github-pages'
  return 'other'
}
