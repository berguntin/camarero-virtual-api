// Coordenadas del restaurante
const initialLat = 39.6043153
const initialLon = -0.5578605
//Definimos el rango permitido
const rangeDistance = process.env.RANGE_DISTANCE;


const checkCoordinatesInRange = (lat2, lon2) => {
    // Radio de la Tierra en metros
    const earthRadius = 6371000;
  
    // Convertir las coordenadas a radianes
    const lat1Rad = toRadians(initialLat);
    const lon1Rad = toRadians(initialLon);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);
  
    // Calcular la distancia entre las coordenadas
    const deltaLat = lat2Rad - lat1Rad;
    const deltaLon = lon2Rad - lon1Rad;
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
   
    // Verificar si la distancia está dentro del rango
    return distance <= rangeDistance;
  }
  
  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  

module.exports = { checkCoordinatesInRange }