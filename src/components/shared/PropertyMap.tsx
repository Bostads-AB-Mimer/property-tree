import React, { useEffect, useRef, useState } from 'react'
import { geocodingService } from '@/services/api/geocodingService'
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
      const coords = await properties.reduce(async (lastPromise, property) => {
        const accumulatedCoords = await lastPromise
        const searchQuery = `${property.designation}, ${property.municipality}, Sweden`
        const result = await geocodingService.searchAddress(searchQuery)
        const coords = result || [18.0686, 59.3293] // Fallback to Stockholm if geocoding fails
        return [...accumulatedCoords, coords]
      }, Promise.resolve([]))

      setCoordinates(coords)

      // Calculate bounds from real coordinates
      if (coords.length > 0) {
        const newBounds = coords.reduce(
          (acc, [lng, lat]) => {
            if (!acc) {
              return [
                [lng, lat],
                [lng, lat],
              ]
            }
            return [
              [Math.min(acc[0][0], lng), Math.min(acc[0][1], lat)],
              [Math.max(acc[1][0], lng), Math.max(acc[1][1], lat)],
            ]
          },
          null as [[number, number], [number, number]] | null
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
