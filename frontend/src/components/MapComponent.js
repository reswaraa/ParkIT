import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { convertSVY21toWGS84 } from '../utils/coordinateConverter';

mapboxgl.accessToken =
  'pk.eyJ1IjoicmVzd2FyYSIsImEiOiJjbTI3NTcxa3AwZ3NoMnFwd3l3NHdlOGEwIn0.p0d9ICR3s3dG01SRL9wazg'; // Replace with your actual token

const MapComponent = ({ carparks, carparkInfo }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [103.8198, 1.3521], // Singapore coordinates
      zoom: 11,
    });

    // Add navigation control (the +/- zoom buttons)
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, []);

  useEffect(() => {
    if (
      !map.current ||
      !carparks ||
      carparks.length === 0 ||
      !carparkInfo ||
      carparkInfo.length === 0
    )
      return;

    // Remove existing markers
    const existingMarkers = document.getElementsByClassName('mapboxgl-marker');
    while (existingMarkers[0]) {
      existingMarkers[0].remove();
    }

    carparks.forEach((carpark) => {
      const info = carparkInfo.find(
        (i) => i.car_park_no === carpark.carpark_number
      );
      if (info && info.x_coord && info.y_coord) {
        const { lat, lon } = convertSVY21toWGS84(
          parseFloat(info.x_coord),
          parseFloat(info.y_coord)
        );

        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor =
          carpark.carpark_info[0].lots_available > 0 ? 'green' : 'red';
        el.style.width = '10px';
        el.style.height = '10px';
        el.style.borderRadius = '50%';

        new mapboxgl.Marker(el)
          .setLngLat([lon, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <h3>${info.address}</h3>
              <p>Available: ${carpark.carpark_info[0].lots_available}</p>
              <p>Total: ${carpark.carpark_info[0].total_lots}</p>
            `)
          )
          .addTo(map.current);
      }
    });
  }, [carparks, carparkInfo]);

  return (
    <div
      ref={mapContainer}
      className="map-container"
      style={{ height: '400px' }}
    />
  );
};

export default MapComponent;
