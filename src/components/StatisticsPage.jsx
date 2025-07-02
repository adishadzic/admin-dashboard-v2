
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const StatisticsPage = () => {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const stats = [
    {
      title: 'Total Tests',
      value: '64',
      change: '+12%',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Students',
      value: '1,247',
      change: '+8%',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Average Score',
      value: '87.3%',
      change: '+5%',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Completion Rate',
      value: '94.2%',
      change: '+3%',
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Statistics</h1>
        <Button onClick={handleAction}>
          Generate Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Performance Over Time</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would go here</p>
              <Button variant="outline" className="mt-2" onClick={handleAction}>
                View Details
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Engagement</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Engagement metrics would go here</p>
              <Button variant="outline" className="mt-2" onClick={handleAction}>
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            'New test "Advanced JavaScript" created',
            'Student "Marko Tomic" completed "React Basics"',
            'Test "Database Design" results published',
            'New student "Ana Petrovic" enrolled'
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">{activity}</span>
              <span className="text-sm text-gray-500 ml-auto">2 hours ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
