import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/StatCard';

export function Dashboard() {
  // TODO: Fetch real data from API
  const stats = [
    {
      name: 'Net Revenue (Today)',
      value: '$1,248',
      change: '+12.3%',
      icon: DollarSign,
      trend: 'up' as const,
    },
    {
      name: 'Utilization Rate',
      value: '78%',
      change: '+5.2%',
      icon: TrendingUp,
      trend: 'up' as const,
    },
    {
      name: 'Appointments',
      value: '24',
      change: '-2',
      icon: Calendar,
      trend: 'down' as const,
    },
    {
      name: 'Active Clients',
      value: '156',
      change: '+8',
      icon: Users,
      trend: 'up' as const,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your shop's performance and key metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Profit Per Chair</h3>
          <p className="text-gray-500">Coming soon...</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
          <p className="text-gray-500">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
