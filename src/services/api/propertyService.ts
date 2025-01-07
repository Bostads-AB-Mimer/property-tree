import { Company, NavigationItem } from '../types'
import { GET } from './baseApi'

export const propertyService = {
  async searchProperties(query: string): Promise<NavigationItem[]> {
    // In a real app this would be an API call
    // For now we'll simulate searching through properties
    const { data, error } = await GET('/properties')
    if (error) throw error
    
    const properties = data.content || []
    const results: NavigationItem[] = []

    // Filter and transform properties
    properties.forEach((property) => {
      if (property.designation.toLowerCase().includes(query.toLowerCase()) ||
          property.code.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: property.id,
          name: property.designation,
          type: 'property',
          metadata: {
            propertyId: property.id
          }
        })
      }
    })

    return results
  },
  async getFromCompany(company: Company) {
    const { data, error } = await GET('/properties', {
      params: { query: { companyCode: company.code } },
    })
    if (error) throw error
    return data.content
  },

  async getPropertyById(propertyId: string) {
    const { data, error } = await GET(`/properties/{id}`, {
      params: { path: { id: propertyId } },
    })
    if (error) throw error
    return data?.content
  },
}
