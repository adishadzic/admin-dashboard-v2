'use client'
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved!",
      description: "Your preferences have been updated.",
    });
  };
  
  const handleFeatureRequest = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl space-y-8">
        <div className='text-black'>
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="email-notifications" defaultChecked onCheckedChange={handleFeatureRequest}/>
              <Label htmlFor="email-notifications">Email notifications for test submissions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="push-notifications" onCheckedChange={handleFeatureRequest}/>
              <Label htmlFor="push-notifications">Push notifications for important announcements</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="new-student-alert" defaultChecked onCheckedChange={handleFeatureRequest}/>
              <Label htmlFor="new-student-alert">Alert when a new student enrolls</Label>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-black text-lg font-semibold mb-4">Theme</h2>
          <div className="flex items-center space-x-4">
             <Button variant="outline" onClick={handleFeatureRequest}>Light Mode</Button>
             <Button variant="outline" onClick={handleFeatureRequest}>Dark Mode</Button>
             <Button variant="outline" onClick={handleFeatureRequest}>System Default</Button>
          </div>
        </div>
        
        <div className="pt-6 border-t">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
