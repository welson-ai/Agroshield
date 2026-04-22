import { WeatherPrediction } from '@/components/weather-prediction'

// Weather prediction page component for forecasting analytics
export default function WeatherPredictionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 p-4">
      <WeatherPrediction />
    </div>
  )
}
