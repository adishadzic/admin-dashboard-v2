'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { initialTests } from '@/lib/data';
import useLocalStorage from '@/hooks/useLocalStorage';

// interface TestsPageProps {
//   tests: Test[];
//   setTests: React.Dispatch<React.SetStateAction<Test[]>>;
//   onAddTest: (test: Test) => void;
// }

const TestsPage: React.FC = () => {
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tests] = useLocalStorage('tests', initialTests);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const testsPerPage = 5;

  const handleTestSelect = (testId: string, checked: boolean | string) => {
    const isChecked = Boolean(checked);
    setSelectedTests(prev => isChecked ? [...prev, testId] : prev.filter(id => id !== testId));
  };
  
  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean | string) => {
    const isChecked = Boolean(checked);
    setSelectedTests(isChecked ? filteredTests.map(test => test.id.toString()) : []);
  };


  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(filteredTests.length / testsPerPage);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kontrolne zadaće</h1>
      </div>
      <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Dodaj kontrolnu zadaću
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-black text-left p-4 w-12">
                  <Checkbox
                    checked={selectedTests.length > 0 && selectedTests.length === currentTests.length}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left text-xs p-4 font-medium text-gray-600 uppercase">NAZIV TESTA</th>
                <th className="text-left text-xs p-4 font-medium text-gray-600 uppercase">START DATE</th>
                <th className="text-left text-xs p-4 font-medium text-gray-600 uppercase">DURATION</th>
                <th className="text-left text-xs p-4 font-medium text-gray-600 uppercase">SELF ASSESSMENT</th>
                <th className="text-left text-xs p-4 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody>
              {currentTests.map((test) => (
                <tr key={test.id} className="text-black border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedTests.includes(test.id.toString())}
                      onCheckedChange={(checked) => handleTestSelect(test.id.toString(), checked)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="test-icon">
                        <img  
                          className="w-8 h-8" 
                          alt="Test icon"
                          src="https://images.unsplash.com/photo-1647485684426-4e4a53cb87a9"
                        />
                      </div>
                      <span className="font-medium text-gray-900">{test.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{test.startDate}</td>
                  <td className="p-4 text-gray-600">{test.duration}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      test.selfAssessment 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {test.selfAssessment ? 'True' : 'False'}
                    </span>
                  </td>
                  <td className="text-black p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {}}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {}}>Download</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center p-8 text-gray-500">No tests found.</div>
        )}

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages} ({filteredTests.length} items)
          </span>
        </div>
      </div>
    </div>
  );
};

export default TestsPage;
