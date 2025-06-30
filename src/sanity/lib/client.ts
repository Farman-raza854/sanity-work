import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false for real-time updates and mutations
  token: process.env.SANITY_API_TOKEN, // Add token for write operations
})