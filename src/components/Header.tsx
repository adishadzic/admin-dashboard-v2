import React, { useState, useEffect, useRef, ChangeEvent, MouseEvent } from 'react';
import { Search, FileText, Bell, ChevronDown, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { SectionId } from '@/types';

interface Test {
  id: string | number;
  name: string;
}

interface HeaderProps {
  setActiveSection: (section: SectionId) => void;
  tests: Test[];
}

const Header: React.FC<HeaderProps> = ({ setActiveSection, tests }) => {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Test[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Ref for the search container div
  const searchRef = useRef<HTMLDivElement | null>(null);

  const handleNotificationClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = tests.filter(test =>
        test.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, tests]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | globalThis.MouseEvent) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 max-w-md" ref={searchRef}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Pretraži testove..."
              className="pl-10 bg-gray-50 border-gray-100 text-black"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(test => (
                    <div
                      key={test.id}
                      className="text-black p-3 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                      onClick={() => {
                        setActiveSection('testovi');
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                    >
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span>{test.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">No results found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleNotificationClick}>
            <FileText className="w-6 h-6 text-black" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleNotificationClick}>
            <Bell className="w-6 h-6 text-black" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <img  
                  className="w-8 h-8 rounded-full object-cover" 
                  alt="Professor profile picture"
                  src="https://images.unsplash.com/photo-1575383596664-30f4489f9786" 
                />
                <ChevronDown className="w-4 h-4 text-black" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='bg-black' align="end">
              <DropdownMenuItem onClick={() => setActiveSection('profile')}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSection('settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleNotificationClick}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
