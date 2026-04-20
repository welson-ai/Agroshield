import React, { useState, useEffect } from 'react';
import { useContract } from 'wagmi';
import { AgroShieldOracle } from '../../contracts/AgroShieldOracle';

interface WeatherData {
  location: string;
  timestamp: number;
  rainfall: number;
  temperature: number;
  humidity: number;
  dataSource: string;
}

interface WeatherPrediction {
  location: string;
  predictedRainfall: number;
  confidence: number;
  predictionPeriod: number;
  dataSource: string;
  createdAt: number;
  isActive: boolean;
}

export const WeatherDashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [predictions, setPredictions] = useState<WeatherPrediction[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(true);

  const oracle = useContract({
    address: '0x1234567890123456789012345678901234567890', // Oracle contract address
    abi: AgroShieldOracle.abi
  });

  useEffect(() => {
    fetchWeatherData();
    fetchPredictions();
  }, []);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    try {
      const locations = ['Nairobi', 'Lagos', 'Accra', 'Kampala', 'Dar es Salaam'];
      const dataPromises = locations.map(location => 
        oracle.getLatestWeatherData(location)
      );
      
      const results = await Promise.allSettled(dataPromises);
      const validData = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      setWeatherData(validData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      const activePredictions = await oracle.getActivePredictions();
      const predictionData = await Promise.all(
        activePredictions.map(id => oracle.getPrediction(id))
      );
      
      setPredictions(predictionData);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const getRainfallColor = (rainfall: number) => {
    if (rainfall < 50) return 'text-green-600';
    if (rainfall < 100) return 'text-yellow-600';
    if (rainfall < 200) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 8000) return 'text-green-600';
    if (confidence >= 6000) return 'text-yellow-600';
    if (confidence >= 4000) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    return `${(confidence / 100).toFixed(1)}%`;
  };

  const filteredWeatherData = selectedLocation 
    ? weatherData.filter(data => data.location.toLowerCase().includes(selectedLocation.toLowerCase()))
    : weatherData;

  const filteredPredictions = selectedLocation
    ? predictions.filter(pred => pred.location.toLowerCase().includes(selectedLocation.toLowerCase()))
    : predictions;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Weather Dashboard</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Filter by location..."
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowPredictions(!showPredictions)}
              className={`px-4 py-2 rounded-lg ${showPredictions ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {showPredictions ? 'Hide' : 'Show'} Predictions
            </button>
          </div>
        </div>

        {/* Weather Data Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Current Weather Data</h3>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading weather data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWeatherData.map((data, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-lg">{data.location}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(data.timestamp * 1000).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rainfall:</span>
                      <span className={`font-semibold ${getRainfallColor(data.rainfall)}`}>
                        {data.rainfall} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-semibold">{data.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humidity:</span>
                      <span className="font-semibold">{data.humidity}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Source: {data.dataSource}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredWeatherData.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">No weather data found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Predictions Section */}
        {showPredictions && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Weather Predictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPredictions.map((prediction, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-lg">{prediction.location}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prediction.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prediction.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Predicted Rainfall:</span>
                      <span className={`font-semibold ${getRainfallColor(prediction.predictedRainfall)}`}>
                        {prediction.predictedRainfall} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className={`font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                        {getConfidenceText(prediction.confidence)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-semibold">{prediction.predictionPeriod} days</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(prediction.createdAt * 1000).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Source: {prediction.dataSource}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPredictions.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">No predictions found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-semibold">Rainfall:</span>
              <span className="text-green-600 ml-2">Low (&lt;50mm)</span>
              <span className="text-yellow-600 ml-2">Medium (50-100mm)</span>
              <span className="text-orange-600 ml-2">High (100-200mm)</span>
              <span className="text-red-600 ml-2">Extreme (&gt;200mm)</span>
            </div>
            <div>
              <span className="font-semibold">Confidence:</span>
              <span className="text-green-600 ml-2">Very High (≥80%)</span>
              <span className="text-yellow-600 ml-2">High (60-80%)</span>
              <span className="text-orange-600 ml-2">Medium (40-60%)</span>
              <span className="text-red-600 ml-2">Low (&lt;40%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
