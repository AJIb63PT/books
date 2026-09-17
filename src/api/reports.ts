import type { TopAuthorsData } from '../types/api'
import { apiClient, unwrapData } from './http'

export async function fetchTopAuthors(year: number): Promise<TopAuthorsData> {
  const response = await apiClient.get('/reports/top-authors', {
    params: { year },
  })
  return unwrapData<TopAuthorsData>(response.data)
}