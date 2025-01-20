import React, { useEffect, useRef, useState } from 'react'
import { geocodingQueue } from '@/utils/geocodingQueue'
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

  const [coordinates, setCoordinates] = React.useState<Array<[number, number]>>(
    []
  )
  const [bounds, setBounds] = React.useState<
    [[number, number], [number, number]] | null
  >(null)

  useEffect(() => {
    const fetchCoordinates = async () => {
      const coords = await Promise.all(
        properties.map(async (property) => {
          const searchQuery = `${property.designation}, ${property.municipality}, Sweden`
          return geocodingQueue.add(searchQuery)
        })
      )

      setCoordinates(coords)

      // Calculate bounds from real coordinates
      if (coords.length > 0) {
        const initialBounds: [[number, number], [number, number]] = [
          [coords[0][0], coords[0][1]],
          [coords[0][0], coords[0][1]]
        ]
        
        const newBounds = coords.reduce<[[number, number], [number, number]]>(
          (acc, [lng, lat]) => {
            return [
              [Math.min(acc[0][0], lng), Math.min(acc[0][1], lat)],
              [Math.max(acc[1][0], lng), Math.max(acc[1][1], lat)]
            ]
          },
          initialBounds
        )

        setBounds(newBounds)
      }
    }

    fetchCoordinates()
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
    <div
      ref={mapContainer}
      style={{ height: '300px' }}
      className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    />
  )
}
