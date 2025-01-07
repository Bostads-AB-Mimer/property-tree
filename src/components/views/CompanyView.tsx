import React from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Users, Home, Wallet } from 'lucide-react'
import { PropertyList } from '../shared/PropertyList'
import { companyService, propertyService } from '../../services/api'
import { ViewHeader } from '../shared/ViewHeader'
import { Card } from '../ui/card'
import { Grid } from '../ui/grid'
import { StatCard } from '../shared/StatCard'
import { CompanyDetails } from '@/services/types'
import { useQuery } from '@tanstack/react-query'

export function CompanyView() {
  const { companyId } = useParams()
  const companyQuery = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.getById(companyId!),
    enabled: !!companyId,
  })

  const propertiesQuery = useQuery({
    queryKey: ['properties', companyId],
    queryFn: () => propertyService.getFromCompany(companyQuery.data!),
    enabled: !!companyQuery.data,
  })

  const isLoading = companyQuery.isLoading || propertiesQuery.isLoading
  const error = companyQuery.error || propertiesQuery.error
  const company = companyQuery.data

  if (isLoading) {
    return (
      <div className="p-8 animate-in">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 animate-pulse" />

        <Grid cols={4} className="mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </Grid>
      </div>
    )
  }

  if (error) {
    console.error('Failed to load company:', error)
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Ett fel uppstod när företaget skulle hämtas
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Försök igen senare eller kontakta support om problemet kvarstår
        </p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Företaget kunde inte hittas
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Kontrollera att företags-ID är korrekt
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 animate-in">
      <ViewHeader
        title={company.name}
        subtitle={`${company.properties?.length} fastigheter`}
        type="Företag"
        icon={Building2}
      />

      <Grid cols={4} className="mb-8">
        <StatCard
          title="Fastigheter"
          value={company.properties?.length}
          icon={Building2}
        />
        <StatCard
          title="Lägenheter"
          value={company.totalApartments}
          icon={Home}
          subtitle={`${company.occupiedApartments} uthyrda`}
        />
        <StatCard
          title="Hyresgäster"
          value={company.occupiedApartments}
          icon={Users}
        />
        <StatCard
          title="Årshyra"
          value={`${company.yearlyRent?.toLocaleString()} kr`}
          icon={Wallet}
        />
      </Grid>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2">
          <PropertyList properties={propertiesQuery.data || []} />
        </div>

        <div className="space-y-6">
          <Card title="Status" icon={Building2}>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Uthyrningsgrad</span>
                  <span className="text-sm font-medium text-green-500">
                    {Math.round(
                      (company.occupiedApartments / company.totalApartments) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${Math.round((company.occupiedApartments / company.totalApartments) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
