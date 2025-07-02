import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import AddTestDialog from '@/components/AddTestDialog';

const TestsPage = ({ tests, onAddTest }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const handleAction = (action) => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Tests</h1>
        <AddTestDialog onAddTest={onAddTest} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* You can add a Filter button here if needed */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg border border-gray-200 p-6 card-hover flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  alt={`${test.name} icon`}
                  src="https://images.unsplash.com/photo-1647485684426-4e4a53cb87a9" // or test.iconUrl if available
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{test.name}</h3>
                  <p className="text-sm text-gray-500">Start Date: {test.startDate}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleAction('edit')}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('download')}>Download</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3 flex-grow">
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-sm font-medium text-gray-900">{test.duration}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Self Assessment</p>
                <p className={`text-sm font-medium ${test.selfAssessment ? 'text-green-600' : 'text-red-600'}`}>
                  {test.selfAssessment ? 'True' : 'False'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleAction('viewDetails')}
              >
                View Test Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-900 mb-2">No tests found</p>
          <p className="text-gray-500">Try adjusting your search or add a new test.</p>
        </div>
      )}
    </div>
  );
};

export default TestsPage;
