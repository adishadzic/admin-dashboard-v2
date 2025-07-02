'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import type { Test, Students, SectionId } from '@/types';

type DashboardProps = {
  tests: Test[];
  students: Students[];
  setActiveSection: (section: SectionId) => void;
  viewStudentProfile: (studentId: number) => void;
};

const Dashboard: React.FC<DashboardProps> = ({
  tests,
  students,
  setActiveSection,
  viewStudentProfile,
}) => {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title:
        "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const recentTests = tests.map((test) => ({
    ...test,
    title: test.name,
    students: `${Math.floor(Math.random() * 50) + 50} students`,
  }));

  const topStudents = students;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tests */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent tests</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('testovi')}
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
                    <DropdownMenuItem onClick={() => handleAction()}>
                      Edit test details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction()}>
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
              onClick={() => setActiveSection('studenti')}
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
                  onClick={() => viewStudentProfile(student.id)}
                >
                  Vidi profil
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
