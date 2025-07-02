
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
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AddStudentDialog = ({ onAddStudent }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [jmbag, setJmbag] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !jmbag || !email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }
    onAddStudent({
      id: Date.now(),
      name,
      jmbag,
      email,
      testsCompleted: 0,
      averageScore: 0,
      lastActive: 'Just now',
      avatarUrl: `https://avatar.vercel.sh/${name.split(' ').join('')}.png`
    });
    toast({
      title: "Success",
      description: "Student added successfully.",
    });
    setOpen(false);
    setName('');
    setJmbag('');
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the details of the new student below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jmbag" className="text-right">
                JMBAG
              </Label>
              <Input id="jmbag" value={jmbag} onChange={(e) => setJmbag(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Student</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
