import React from 'react'
import { Company } from '@/services/types'
import { Skeleton } from '../ui/skeleton'
import { SidebarMenu } from '../ui/sidebar'
import { PropertyNavigation } from './Property'
import { useQuery } from '@tanstack/react-query'
import { propertyService } from '@/services/api'
import { MapPin } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '../ui/sidebar'

interface PropertyListProps {
  company: Company
}

export function PropertyList({ company }: PropertyListProps) {
  const {
    data: properties,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['propertiesForCompanyId', company.id],
    queryFn: async () => propertyService.getFromCompany(company),
  })

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-8 mx-2 mb-2" />
        <Skeleton className="h-8 mx-2" />
      </>
    )
  }

  if (error) {
    console.error(`Failed to load properties for company ${company.id}:`, error)
    return (
      <div className="text-sm text-destructive px-2">
        Failed to load properties
      </div>
    )
  }

  // Group properties by tract
  const propertiesByTract = properties?.reduce((acc, property) => {
    const tract = property.tract || 'Övriga'
    if (!acc[tract]) {
      acc[tract] = []
    }
    acc[tract].push(property)
    return acc
  }, {} as Record<string, typeof properties>)

  return (
    <div className="space-y-2">
      {propertiesByTract && Object.entries(propertiesByTract).map(([tract, tractProperties]) => (
        <Collapsible key={tract} defaultOpen>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {tract}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tractProperties.map((property) => (
                    <PropertyNavigation key={property.id} property={property} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </div>
  )
}
