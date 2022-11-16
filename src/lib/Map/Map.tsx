import React from 'react';

import { default as OLMap } from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { Feature, MapBrowserEvent } from 'ol';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';

import './map.css'

type Props = {
  children: React.ReactNode
}

const Map: React.FC<Props> = ({ children }) => {

  const generateMarkers = React.useCallback(() => {

    const generateVector = (src: string, coords: [number, number], id: string, name?: string) => {
      const iconFeature = new Feature({
        geometry: new Point(coords),
        name: name ?? '',
      });

      iconFeature.setId(id)

      const iconStyle = new Style({
        image: new Icon({
          opacity: 1,
          src: src,
        }),
      });

      iconFeature.setStyle(iconStyle);

      const vectorSource = new VectorSource({
        features: [iconFeature],
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      return vectorLayer;

    }

    if (Array.isArray(children)) {
      const res = children.map(v => {
        if ('props' in v && 'src' in v.props && 'coords' in v.props && 'id' in v.props) {
          return generateVector(v.props.src, v.props.coords, v.props.id, v.props.name)
        }

        return null
      }).filter(v => !!v)

      console.log(res);
      return res;
    } else if (typeof children === 'object' && children && 'props' in children) {
      return [generateVector(children.props.src, children.props.coords, children.props.id, children.props.name)]
    }

    return []
  }, [children])

  React.useEffect(() => {
    const markers = generateMarkers()

    const map = new OLMap({
      target: document.getElementById("map") ?? 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        }),
        // @ts-ignore
        ...markers
      ],
      view: new View({
        //  EPSG:3857 reversed
        center: [4071043.9470975567, 6545824.047756359],
        zoom: 15
      })
    });


    map.on('click', (event: MapBrowserEvent<any>) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, el => el)

      if (feature) {
        if (Array.isArray(children)) {
          const currentMarker = children.find(v => v.props.id === feature.getId())

          if (currentMarker) {
            currentMarker.props.onClick();
          }
        } else if (typeof children === 'object' && children && 'props' in children) {
          children.props.onClick()
        }
      }
    })

    map.on('pointermove', (event: MapBrowserEvent<any>) => {
      const pixel = map.getEventPixel(event.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      const target = map.getTarget();
      if (target && typeof target === 'object') {
        target.style.cursor = hit ? 'pointer' : '';
      }
    });
  }, [generateMarkers])

  return <div id="map" className="map">{children}</div>
}

export default Map;
