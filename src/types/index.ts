export interface Student {
    id: number
    name: string
    email: string
    course: string
    status: 'Active' | 'Inactive' | 'Graduated'
    enrolledDate: string
  }

  export type Students = {
    id: number;
    name: string;
    jmbag: string;
    email: string;
    testsCompleted: number;
    averageScore: number;
    lastActive: string;
    avatarUrl: string;
  };

  export type Test = {
    id: number;
    name: string;
    startDate: string;
    duration: string;
    selfAssessment: boolean;
    completed: boolean;
  };
  
  export interface DashboardStats {
    totalStudents: number
    activeCourses: number
    pendingTasks: number
    monthlyGrowth: string
  }
  
  export interface Activity {
    id: number
    message: string
    timestamp: string
    type: 'info' | 'success' | 'warning' | 'error'
  }

  export const SECTION_IDS = {
    DASHBOARD: 'dashboard',
    STATISTIKA: 'statistika',
    TESTOVI: 'testovi',
    STUDENTI: 'studenti',
    PROFILE: 'profile',
    STUDENT_PROFILE: 'studentProfile',
    SETTINGS: 'settings',
  } as const;
  
  export type SectionId = typeof SECTION_IDS[keyof typeof SECTION_IDS];