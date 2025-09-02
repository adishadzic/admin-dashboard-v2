// types/student.ts
export type StudentYear = 1 | 2 | 3 | 4 | 5;

export interface StudentDoc {
  fullName: string;
  email: string;
  jmbag: string;
  year: StudentYear;
  avatarUrl?: string;
  testsCompleted?: number;
  averageScore?: number;
  lastActive?: string;
  authUid?: string;
  createdAt: number;
}

export interface Student extends StudentDoc {
  id: string;
}
