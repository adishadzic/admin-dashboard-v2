export interface Student {
  id: number;
  name: string;
  jmbag: string;
  email: string;
  testsCompleted: number;
  averageScore: number;
  lastActive: string;
  avatarUrl: string;
}

export const initialStudents: Student[] = [
  {
    id: 1,
    name: "Marko Tomic",
    jmbag: "09021390123",
    email: "marko.tomic@student.fipu.hr",
    testsCompleted: 12,
    averageScore: 87.5,
    lastActive: "2 hours ago",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Ivan Horvat",
    jmbag: "23183182373",
    email: "ivan.horvat@student.fipu.hr",
    testsCompleted: 8,
    averageScore: 92.3,
    lastActive: "1 day ago",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Ana Petrovic",
    jmbag: "45678901234",
    email: "ana.petrovic@student.fipu.hr",
    testsCompleted: 15,
    averageScore: 89.1,
    lastActive: "3 hours ago",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Petra Novak",
    jmbag: "56789012345",
    email: "petra.novak@student.fipu.hr",
    testsCompleted: 10,
    averageScore: 85.7,
    lastActive: "5 hours ago",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
  },
];

export interface Test {
  id: number;
  name: string;
  startDate: string;
  duration: string;
  selfAssessment: boolean;
  completed: boolean;
}
