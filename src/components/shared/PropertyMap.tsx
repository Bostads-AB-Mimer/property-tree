import React, { useEffect, useRef, useState } from 'react'
import { geocodingQueue } from '@/utils/geocodingQueue'
import { Map } from 'maplibre-gl'
import { Expand, Minimize2 } from 'lucide-react'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer } from '@deck.gl/layers'
import 'maplibre-gl/dist/maplibre-gl.css'

import { Property } from '@/services/types'

interface PropertyMapProps {
  properties: Property[]
  companyName?: string
}

export function PropertyMap({ properties, companyName }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<Map | null>(null)

  const [coordinates, setCoordinates] = React.useState<Array<[number, number]>>(
    []
  )
  const [bounds, setBounds] = React.useState<
    [[number, number], [number, number]] | null
  >(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const processedProperties = new Set<string>()

    properties.forEach((property) => {
      if (processedProperties.has(property.id)) return
      
      const searchQuery = `${property.designation}, ${property.municipality}, Sweden`
      
      geocodingQueue.add(
        searchQuery,
        (coords) => {
          setCoordinates(prev => {
            const newCoords = [...prev, coords]
            
            // Update bounds with new coordinate
            if (newCoords.length === 1) {
              setBounds([[coords[0], coords[1]], [coords[0], coords[1]]])
            } else {
              setBounds(prevBounds => {
                if (!prevBounds) return [[coords[0], coords[1]], [coords[0], coords[1]]]
                return [
                  [
                    Math.min(prevBounds[0][0], coords[0]),
                    Math.min(prevBounds[0][1], coords[1])
                  ],
                  [
                    Math.max(prevBounds[1][0], coords[0]),
                    Math.max(prevBounds[1][1], coords[1])
                  ]
                ]
              })
            }
            
            return newCoords
          })
        },
        (error) => console.error(`Geocoding error for ${property.designation}:`, error)
      )
      
      processedProperties.add(property.id)
    })

    // Cleanup function to reset coordinates when properties change
    return () => {
      setCoordinates([])
      setBounds(null)
    }
  }, [properties])

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [18.0686, 59.3293], // Stockholm
      zoom: 11,
    })

    map.current.once('load', () => {
      const points = properties.map((property, index) => ({
        position: coordinates[index],
        property: property,
      }))

      const deckOverlay = new MapboxOverlay({
        interleaved: true,
        layers: [
          new ScatterplotLayer({
            id: 'properties',
            data: points,
            getPosition: (d) => d.position,
            getFillColor: [65, 105, 225], // Royal blue
            getRadius: 300,
            pickable: true,
            onClick: (info) => {
              if (info.object && info.object.property) {
                console.log(
                  'Clicked property:',
                  info.object.property.designation
                )
              }
            },
            updateTriggers: {
              getFillColor: points,
            },
          }),
        ],
      })

      map.current?.addControl(deckOverlay)

      // Fit bounds if we have properties
      if (bounds) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        })
      }
    })

    return () => {
      map.current?.remove()
    }
  }, [properties, bounds])

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        style={{ height: isExpanded ? '80vh' : '300px' }}
        className={`w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
          isExpanded ? 'fixed top-4 left-4 right-4 z-50' : ''
        }`}
      />
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-2 right-2 p-2 bg-white rounded-md shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 z-50"
        aria-label={isExpanded ? 'Minimize map' : 'Expand map'}
      >
        {isExpanded ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Expand className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
