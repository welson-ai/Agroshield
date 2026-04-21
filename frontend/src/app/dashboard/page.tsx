import { FarmerDashboard } from '@/components/farmer-dashboard'

// Dashboard page component for farmer overview
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
      <FarmerDashboard />
    </div>
  )
}
