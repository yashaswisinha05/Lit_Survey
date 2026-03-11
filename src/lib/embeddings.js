/**
 * Semantic embeddings using Transformers.js (runs 100% in the browser).
 * Model: all-MiniLM-L6-v2 (~22MB, downloads once and is cached)
 * Outputs: 384-dimensional vector
 */

let pipeline = null

async function getPipeline() {
  if (pipeline) return pipeline
  const { pipeline: createPipeline } = await import('@xenova/transformers')
  pipeline = await createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  return pipeline
}

/**
 * Generate an embedding vector for a given text.
 * @param {string} text - The text to embed (e.g., paper abstract)
 * @returns {Promise<number[]>} A 384-dimensional embedding vector
 */
export async function generateEmbedding(text) {
  try {
    const extractor = await getPipeline()
    const output = await extractor(text, { pooling: 'mean', normalize: true })
    return Array.from(output.data)
  } catch (err) {
    console.error('Embedding generation failed:', err)
    return null
  }
}
