'use client'
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const SettingsPage = () => {
  const handleSave = () => {
  };
  
  const handleFeatureRequest = () => {
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Postavke</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl space-y-8">
        <div className='text-black'>
          <h2 className="text-lg font-semibold mb-4">Obavijesti</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="email-notifications" defaultChecked onCheckedChange={handleFeatureRequest}/>
              <Label htmlFor="email-notifications">E-mail obavijesti za predaje testova</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="push-notifications" onCheckedChange={handleFeatureRequest}/>
              <Label htmlFor="push-notifications">Push obavijesti za važne najave</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="new-student-alert" onCheckedChange={handleFeatureRequest}/>
              <Label htmlFor="new-student-alert">Obavijest kada se upiše novi student</Label>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-black text-lg font-semibold mb-4">Tema</h2>
          <div className="flex items-center space-x-4">
             <Button variant="outline" onClick={handleFeatureRequest}>Svijetli način</Button>
             <Button variant="outline" onClick={handleFeatureRequest}>Tamni način</Button>
          </div>
        </div>
        
        <div className="pt-6 border-t">
          <Button onClick={handleSave}>Spremi promjene</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
