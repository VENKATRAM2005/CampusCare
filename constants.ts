
import { ComplaintCategory, Department, StudentDept, Role } from './types';

export const HIGH_PRIORITY_KEYWORDS = [
  'urgent', 'immediately', 'danger', 'life threatening', 'unsafe', 'fire', 
  'electrical', 'short circuit', 'injury', 'bleeding', 'harassment', 
  'ragging', 'violence', 'abuse', 'threat', 'collapsed', 'no water', 
  'water leakage', 'broken', 'damaged', 'gas leak', 'emergency', 
  'security issue', 'accident', 'critical', 'severe', 'mental trauma', 
  'suicidal', 'panic', 'explosion', 'assault', 'bullying'
];

export const MOCK_USERS = {
  // Student
  '20232476': { name: 'VENKATRAM R', role: Role.STUDENT, dept: StudentDept.CSE, password: 'password' },
  '20230001': { name: 'Aarav Sharma', role: Role.STUDENT, dept: StudentDept.ECE, password: 'password' },
  
  // Staff
  '4321': { name: 'Sujeetha', role: Role.STAFF, dept: Department.CSE, password: 'password' },
  
  // HOD
  '1234': { name: 'Dr.S.SIVAKUMAR', role: Role.HOD, dept: Department.CSE, password: 'password' },
  
  // Admin
  '123': { name: 'Principal Office', role: Role.ADMIN, password: 'password' },
};

export const CATEGORY_ROUTING: Record<ComplaintCategory, (studentDept: StudentDept) => Department> = {
  [ComplaintCategory.INFRASTRUCTURE]: () => Department.MAINTENANCE,
  [ComplaintCategory.ACADEMICS]: (studentDept) => studentDept as unknown as Department,
  [ComplaintCategory.RAGGING]: () => Department.ANTI_RAGGING,
  [ComplaintCategory.STAFF_RELATED]: (studentDept) => studentDept as unknown as Department,
  [ComplaintCategory.OTHERS]: () => Department.ADMINISTRATION,
};

export const STUDENT_DEPTS = Object.values(StudentDept);
export const COMPLAINT_CATEGORIES = Object.values(ComplaintCategory);

export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  ESCALATED: 'bg-red-100 text-red-800'
};

export const PRIORITY_COLORS = {
  LOW: 'bg-slate-100 text-slate-800',
  MEDIUM: 'bg-orange-100 text-orange-800',
  HIGH: 'bg-red-600 text-white animate-pulse'
};

export const PRIORITY_LEVELS = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};
