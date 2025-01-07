import React from 'react'
import { DeckGL } from 'deck.gl'
import { ScatterplotLayer } from '@deck.gl/layers'
import { Map } from 'react-map-gl'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface PropertyMapProps {
  latitude?: number
  longitude?: number
  address?: string
}

export function PropertyMap({ latitude = 59.3293, longitude = 18.0686, address }: PropertyMapProps) {
  const INITIAL_VIEW_STATE = {
    latitude,
    longitude,
    zoom: 13,
    pitch: 0,
    bearing: 0
  }

  const layers = [
    new ScatterplotLayer({
      id: 'property',
      data: [{position: [longitude, latitude], address}],
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 5,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: d => d.position,
      getFillColor: [255, 0, 0],
      getLineColor: [0, 0, 0],
      getTooltip: ({object}) => object && object.address
    })
  ]

  return (
    <div style={{height: '300px'}} className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map 
          mapLib={maplibregl}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        />
      </DeckGL>
    </div>
  )
}
