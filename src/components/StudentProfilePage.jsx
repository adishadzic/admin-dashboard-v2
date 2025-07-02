
import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, BookOpen, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const StudentProfilePage = ({ student, setActiveSection }) => {
  const { toast } = useToast();

  if (!student) {
    return (
      <div className="p-6 text-center">
        <p>Student not found. Please go back and select a student.</p>
        <Button onClick={() => setActiveSection('studenti')} className="mt-4">Back to Students</Button>
      </div>
    );
  }
  
  const handleAction = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  }

  const recentActivity = [
    { title: 'Completed "Javascript kviz"', date: '2 days ago' },
    { title: 'Scored 95% on "Group test #1"', date: '5 days ago' },
    { title: 'Started "React Advanced Concepts"', date: '1 week ago' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Student Profile</h1>
        <Button onClick={() => setActiveSection('studenti')}>Back to Students</Button>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
          <img
            className="w-32 h-32 rounded-full object-cover"
            alt={`${student.name} profile picture`}
            src={student.avatarUrl}
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{student.name}</h2>
            <p className="text-muted-foreground">{student.email}</p>
            <p className="text-sm text-gray-500">JMBAG: {student.jmbag}</p>
            <div className="mt-4 flex space-x-2">
              <Button onClick={handleAction}>Send Message</Button>
              <Button variant="outline" onClick={handleAction}>Export Data</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6 flex items-center space-x-4 card-hover">
          <div className="p-3 bg-blue-100 rounded-lg"><BookOpen className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Tests Completed</p>
            <p className="text-2xl font-bold">{student.testsCompleted}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6 flex items-center space-x-4 card-hover">
          <div className="p-3 bg-green-100 rounded-lg"><TrendingUp className="w-6 h-6 text-green-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-2xl font-bold text-green-600">{student.averageScore}%</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6 flex items-center space-x-4 card-hover">
          <div className="p-3 bg-purple-100 rounded-lg"><CheckCircle className="w-6 h-6 text-purple-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Last Active</p>
            <p className="text-lg font-semibold">{student.lastActive}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <ul className="space-y-4">
          {recentActivity.map((activity, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.date}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentProfilePage;
