import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const ProfessorProfilePage = ({ setActiveSection }) => {
  const { toast } = useToast();

  const handleUpdate = (e) => {
    e.preventDefault();
    toast({
      title: "Profile Updated!",
      description: "Your information has been saved.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <Button onClick={() => setActiveSection('dashboard')}>Back to Dashboard</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex items-center space-x-6">
            <img
              className="w-24 h-24 rounded-full object-cover"
              alt="Professor profile picture"
              src="https://images.unsplash.com/photo-1575383596664-30f4489f9786"
            />
            <div>
              <h2 className="text-xl font-bold">Ime Prezime</h2>
              <p className="text-muted-foreground">Professor of Computer Science</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => toast({ title: "🚧 Feature not implemented yet" })}>
                Change Photo
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue="Ime Prezime" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="ime.prezime@fipu.hr" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" defaultValue="+123 456 7890" />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" defaultValue="Computer Science" />
            </div>
          </div>
          <div>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessorProfilePage;
