'use client'

import { Button } from '@/components/ui/button'
import useLocalStorage from '@/hooks/useLocalStorage';
import { initialStudents, initialTests } from '@/lib/data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import {
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  UserPlus,
  CheckCircle,
  AlarmClock,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react'
import { useRouter } from 'next/navigation';

export default function Home() {
  const [students] = useLocalStorage('students', initialStudents);
  const [tests] = useLocalStorage('tests', initialTests);

  const router = useRouter();

  const recentTests = tests.map((test) => ({
    ...test,
    title: test.name,
    students: `${Math.floor(Math.random() * 50) + 50} students`,
  }));

  const topStudents = students;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dobar dan!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-semibold text-gray-900">56</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">23</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
              <p className="text-2xl font-semibold text-gray-900">12%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tests */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent tests</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/tests')}
            >
              View all
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="space-y-4">
            {recentTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors card-hover"
              >
                <div className="test-icon">
                  <img
                    className="w-8 h-8"
                    alt="JavaScript quiz icon"
                    src="https://images.unsplash.com/photo-1597440836382-e5f0bd6155f7"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{test.title}</h3>
                  <p className="text-sm text-gray-500">
                    {test.duration} • {test.startDate} • {test.students}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {}}>
                      Edit test details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      See results
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Students */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Top performing students
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
            >
              View all
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wide pb-2 border-b">
              <span>IME I PREZIME</span>
              <span>JMBAG</span>
              <span>ACTION</span>
            </div>

            {topStudents.map((student) => (
              <div
                key={student.id}
                className="grid grid-cols-3 gap-4 items-center py-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="font-medium text-gray-900">{student.name}</span>
                <span className="text-gray-600">{student.jmbag}</span>
                <Button
                  variant="link"
                  className="text-blue-600 hover:text-blue-800 justify-start p-0"
                  onClick={() => {}}
                >
                  Vidi profil
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-1 bg-blue-100 rounded-full">
                <UserPlus className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New student registered: John Doe</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-1 bg-green-100 rounded-full">
                <BookOpen className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Course Fundamentals completed by 5 students</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-1 bg-yellow-100 rounded-full">
                <AlarmClock className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Assignment deadline reminder sent</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
