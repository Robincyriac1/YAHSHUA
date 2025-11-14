import express from 'express';
import { integrationManager } from '../services/integrations';

const router = express.Router();

// Get integration service status
router.get('/status', async (req, res) => {
  try {
    const serviceStatus = integrationManager.getServiceStatus();
    const healthStatus = await integrationManager.checkAllServiceHealth();
    
    res.json({
      services: serviceStatus,
      health: healthStatus,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to get integration status:', error);
    res.status(500).json({ error: 'Failed to get integration status' });
  }
});

// Get carbon intensity for a zone
router.get('/carbon-intensity/:zone', async (req, res) => {
  try {
    const { zone } = req.params;
    const data = await integrationManager.getCarbonIntensity(zone);
    
    if (!data) {
      return res.status(404).json({ error: 'Carbon intensity data not available' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Failed to get carbon intensity:', error);
    res.status(500).json({ error: 'Failed to get carbon intensity' });
  }
});

// Get weather data for coordinates
router.get('/weather/:lat/:lng', async (req, res) => {
  try {
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
    
    const data = await integrationManager.getWeatherData(lat, lng);
    
    if (!data) {
      return res.status(404).json({ error: 'Weather data not available' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Failed to get weather data:', error);
    res.status(500).json({ error: 'Failed to get weather data' });
  }
});

// Search equipment
router.get('/equipment/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const criteria = req.query;
    
    if (!['solar', 'wind', 'hydro', 'battery'].includes(type)) {
      return res.status(400).json({ error: 'Invalid equipment type' });
    }
    
    const equipment = await integrationManager.searchEquipment(
      type as 'solar' | 'wind' | 'hydro' | 'battery',
      criteria
    );
    
    res.json({
      type,
      equipment,
      count: equipment.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to search equipment:', error);
    res.status(500).json({ error: 'Failed to search equipment' });
  }
});

// Get comprehensive project environmental data
router.get('/project/:projectId/environmental', async (req, res) => {
  try {
    const { projectId } = req.params;
    const data = await integrationManager.getProjectEnvironmentalData(projectId);
    
    if (!data) {
      return res.status(404).json({ error: 'Project environmental data not available' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Failed to get project environmental data:', error);
    res.status(500).json({ error: 'Failed to get project environmental data' });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await integrationManager.checkAllServiceHealth();
    const allHealthy = Object.values(healthStatus).every(status => status);
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      services: healthStatus,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to check integration health:', error);
    res.status(500).json({ error: 'Failed to check integration health' });
  }
});

// Get comprehensive integration dashboard data
router.get('/dashboard/:lat/:lng/:zone?', async (req, res) => {
  try {
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);
    const zone = req.params.zone || 'US';
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Fetch all integration data in parallel
    const [serviceStatus, healthStatus, carbonData, weatherData, equipmentData] = await Promise.all([
      integrationManager.getServiceStatus(),
      integrationManager.checkAllServiceHealth(),
      integrationManager.getCarbonIntensity(zone),
      integrationManager.getWeatherData(lat, lng),
      integrationManager.getEquipmentData('solar') // Default to solar equipment
    ]);

    // Calculate derived metrics
    const currentTime = new Date();
    const solarIrradiance = weatherData?.current?.solarIrradiance || 0;
    const cloudCover = weatherData?.current?.cloudCover || 0;
    const windSpeed = weatherData?.current?.windSpeed || 0;
    
    // Estimate renewable energy potential
    const solarPotential = solarIrradiance * (1 - cloudCover / 100) * 0.2; // Rough solar estimate
    const windPotential = Math.pow(windSpeed, 3) * 0.5; // Rough wind estimate
    
    const dashboardData = {
      location: { lat, lng, zone },
      timestamp: currentTime.toISOString(),
      services: {
        status: serviceStatus,
        health: healthStatus,
        lastUpdate: currentTime.toISOString()
      },
      environmental: {
        carbonIntensity: carbonData,
        weather: weatherData,
        renewable_potential: {
          solar: Math.round(solarPotential),
          wind: Math.round(windPotential),
          total: Math.round(solarPotential + windPotential)
        }
      },
      equipment: {
        available: equipmentData?.equipment || [],
        categories: equipmentData ? Object.keys(equipmentData).filter(k => k !== 'equipment') : []
      },
      insights: {
        optimal_generation_time: solarIrradiance > 800 ? 'Now' : 'Later today',
        carbon_reduction_potential: carbonData ? Math.round(carbonData.carbonIntensity * 0.1) : 0,
        weather_impact: cloudCover > 70 ? 'High cloud cover may reduce solar efficiency' : 'Good conditions for solar generation'
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Failed to get integration dashboard data:', error);
    res.status(500).json({ error: 'Failed to get integration dashboard data' });
  }
});

export default router;
