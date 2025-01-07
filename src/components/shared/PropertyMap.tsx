import React, { useEffect, useRef } from 'react'
import { Map } from 'maplibre-gl'
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

  // Calculate bounds for all properties
  const bounds = properties.reduce((acc, property) => {
    // Mock coordinates - in a real app these would come from the API
    const lat = 59.3293 + (Math.random() - 0.5) * 0.1
    const lng = 18.0686 + (Math.random() - 0.5) * 0.1
    
    if (!acc) {
      return [[lng, lat], [lng, lat]]
    }
    
    return [
      [Math.min(acc[0][0], lng), Math.min(acc[0][1], lat)],
      [Math.max(acc[1][0], lng), Math.max(acc[1][1], lat)]
    ]
  }, null as [[number, number], [number, number]] | null)

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [18.0686, 59.3293], // Stockholm
      zoom: 11
    })

    map.current.once('load', () => {
      // Convert properties to map points
      const points = properties.map(property => ({
        position: [
          18.0686 + (Math.random() - 0.5) * 0.1, // Mock longitude
          59.3293 + (Math.random() - 0.5) * 0.1,  // Mock latitude
        ],
        property: property
      }))

      const deckOverlay = new MapboxOverlay({
        interleaved: true,
        layers: [
          new ScatterplotLayer({
            id: 'properties',
            data: points,
            getPosition: d => d.position,
            getFillColor: [65, 105, 225], // Royal blue
            getRadius: 300,
            pickable: true,
            onClick: (info) => {
              if (info.object && info.object.property) {
                console.log('Clicked property:', info.object.property.designation)
              }
            },
            updateTriggers: {
              getFillColor: points
            }
          })
        ]
      })

      map.current?.addControl(deckOverlay)

      // Fit bounds if we have properties
      if (bounds) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        })
      }
    })

    return () => {
      map.current?.remove()
    }
  }, [properties, bounds])

  return (
    <div 
      ref={mapContainer} 
      style={{height: '300px'}} 
      className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    />
  )
}
