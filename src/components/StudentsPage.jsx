
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, MoreHorizontal, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import AddStudentDialog from '@/components/AddStudentDialog';

const StudentsPage = ({ students, onAddStudent, viewStudentProfile }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const handleAction = (action) => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.jmbag.includes(searchTerm) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <AddStudentDialog onAddStudent={onAddStudent} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => handleAction('filter')}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-lg border border-gray-200 p-6 card-hover flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img  
                  className="w-12 h-12 rounded-full object-cover" 
                  alt={`${student.name} profile picture`}
                 src={student.avatarUrl} />
                <div>
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.jmbag}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => viewStudentProfile(student.id)}>
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('sendMessage')}>
                    Send Message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3 flex-grow">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{student.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tests Completed</p>
                  <p className="text-lg font-semibold text-gray-900">{student.testsCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Score</p>
                  <p className="text-lg font-semibold text-green-600">{student.averageScore}%</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => viewStudentProfile(student.id)}
              >
                View Full Profile
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500">Try adjusting your search or add a new student.</p>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
