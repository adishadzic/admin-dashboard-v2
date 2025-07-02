
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AddTestDialog = ({ onAddTest }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [selfAssessment, setSelfAssessment] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !duration) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }
    const currentDate = new Date();
    onAddTest({
      id: Date.now(),
      name,
      startDate: currentDate.toLocaleDateString('en-GB'), // dd/mm/yyyy
      duration: `${duration} minuta`,
      selfAssessment,
      completed: false
    });
    toast({
      title: "Success",
      description: "Test added successfully.",
    });
    setOpen(false);
    setName('');
    setDuration('');
    setSelfAssessment(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novi test
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Test</DialogTitle>
          <DialogDescription>
            Enter the details of the new test below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Test Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (min)
              </Label>
              <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="col-span-3" />
            </div>
            <div className="flex items-center space-x-2 justify-center col-span-4">
              <Checkbox id="selfAssessment" checked={selfAssessment} onCheckedChange={setSelfAssessment} />
              <Label htmlFor="selfAssessment">Self Assessment</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Test</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTestDialog;
