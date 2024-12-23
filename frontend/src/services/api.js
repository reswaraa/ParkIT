import axios from 'axios';
import Papa from 'papaparse';
import { convertSVY21toWGS84 } from '../utils/coordinateConverter';

export const fetchCarparks = async () => {
  try {
    const response = await axios.get(
      'https://api.data.gov.sg/v1/transport/carpark-availability'
    );
    return response.data.items[0].carpark_data;
  } catch (error) {
    console.error('Error fetching carpark data:', error);
    throw error;
  }
};

export const fetchCarparkInfo = async () => {
  try {
    const response = await fetch('/static/HDBCarparkInformation.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvData = await response.text();
    const results = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/ /g, '_'),
    });
    return results.data.map((entry) => {
      const { lat, lon } = convertSVY21toWGS84(
        parseFloat(entry.x_coord),
        parseFloat(entry.y_coord)
      );
      return {
        ...entry,
        latitude: lat,
        longitude: lon,
      };
    });
  } catch (error) {
    console.error('Error fetching or parsing carpark info:', error);
    throw error;
  }
};

export const generateRandomRate = () => {
  return (Math.random() * 2.5 + 0.5).toFixed(2);
};
