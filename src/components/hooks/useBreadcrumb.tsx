import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { buildingService, propertyService, residenceService } from '@/services/api'

export function useBreadcrumb() {
  const location = useLocation()
  const path = location.pathname.split('/')
  const type = path[1]
  const id = path[2]

  const propertyQuery = useQuery({
    queryKey: ['breadcrumb-property', id],
    queryFn: () => propertyService.getPropertyById(id),
    enabled: type === 'properties',
  })

  const buildingQuery = useQuery({
    queryKey: ['breadcrumb-building', id],
    queryFn: () => buildingService.getById(id),
    enabled: type === 'buildings',
  })

  const residenceQuery = useQuery({
    queryKey: ['breadcrumb-residence', id],
    queryFn: () => residenceService.getById(id),
    enabled: type === 'residences',
  })

  const items = []

  if (type === 'properties' && propertyQuery.data) {
    items.push({
      label: propertyQuery.data.designation,
      href: `/properties/${propertyQuery.data.id}`,
    })
  }

  if (type === 'buildings' && buildingQuery.data) {
    items.push({
      label: buildingQuery.data.name,
      href: `/buildings/${buildingQuery.data.id}`,
    })
  }

  if (type === 'residences' && residenceQuery.data) {
    items.push({
      label: residenceQuery.data.name,
      href: `/residences/${residenceQuery.data.id}`,
    })
  }

  return { items, isLoading: propertyQuery.isLoading || buildingQuery.isLoading || residenceQuery.isLoading }
}
