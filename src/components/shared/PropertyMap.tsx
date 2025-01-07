import React, { useEffect, useRef } from 'react'
import { Map } from 'maplibre-gl'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer } from '@deck.gl/layers'
import 'maplibre-gl/dist/maplibre-gl.css'

interface PropertyMapProps {
  latitude?: number
  longitude?: number
  address?: string
}

export function PropertyMap({ latitude = 59.3293, longitude = 18.0686, address }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [longitude, latitude],
      zoom: 13
    })

    map.current.once('load', () => {
      const deckOverlay = new MapboxOverlay({
        interleaved: true,
        layers: [
          new ScatterplotLayer({
            id: 'property',
            data: [{position: [longitude, latitude], address}],
            getPosition: d => d.position,
            getFillColor: [255, 0, 0],
            getRadius: 500,
            pickable: true,
            onClick: (info) => {
              if (info.object && info.object.address) {
                // Could show a tooltip or handle click
                console.log(info.object.address)
              }
            }
          })
        ]
      })

      map.current?.addControl(deckOverlay)
    })

    return () => {
      map.current?.remove()
    }
  }, [latitude, longitude, address])

  return (
    <div 
      ref={mapContainer} 
      style={{height: '300px'}} 
      className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    />
  )
}
