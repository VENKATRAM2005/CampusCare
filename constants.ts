
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
  // Students (CSE)
  '721423104056': { name: 'Venkatram R', role: Role.STUDENT, dept: StudentDept.CSE, password: 'Niet@123' },
  '721423104044': { name: 'Pukazhya P', role: Role.STUDENT, dept: StudentDept.CSE, password: 'Niet@123' },
  '721423104006': { name: 'Agastin A', role: Role.STUDENT, dept: StudentDept.CSE, password: 'Niet@123' },
  '721423104015': { name: 'Aswini A', role: Role.STUDENT, dept: StudentDept.CSE, password: 'Niet@123' },
  
  // Mentor
  '001': { name: 'Ms. D Sujeetha', role: Role.MENTOR, dept: Department.CSE, password: 'staff@123' },
  '002': { name: 'Ms. S Priya', role: Role.MENTOR, dept: Department.CSE, password: 'staff@123' },
  '007': { name: 'Dr. S Meena', role: Role.MENTOR, dept: Department.ANTI_RAGGING, password: 'staff@123' },
  '008': { name: 'Mr. R Kumar', role: Role.MENTOR, dept: Department.MAINTENANCE, password: 'staff@123' },
  '009': { name: 'Ms. L Sarah', role: Role.MENTOR, dept: Department.ADMINISTRATION, password: 'staff@123' },
  
  // HOD
  '01': { name: 'Dr. S Sivakumar', role: Role.HOD, dept: Department.CSE, password: 'staff@123' },
  '02': { name: 'Dr. K Arul', role: Role.HOD, dept: Department.ANTI_RAGGING, password: 'staff@123' },
  
  // Admin
  '1': { name: 'Dr. P Maniiarasan', role: Role.ADMIN, password: 'admin@123' },
};

export const CATEGORY_ROUTING: Record<ComplaintCategory, (studentDept: StudentDept) => Department> = {
  [ComplaintCategory.INFRASTRUCTURE]: () => Department.MAINTENANCE,
  [ComplaintCategory.ACADEMICS]: (studentDept) => studentDept as unknown as Department,
  [ComplaintCategory.RAGGING]: () => Department.ANTI_RAGGING,
  [ComplaintCategory.MENTOR_RELATED]: (studentDept) => studentDept as unknown as Department,
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
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
};

export const TEACHING_REVIEW_QUESTIONS = [
  "Clarity of explanations and communication skills.",
  "Punctuality and regularity in conducting classes.",
  "Ability to engage students and encourage participation.",
  "Knowledge and expertise in the subject matter.",
  "Fairness and transparency in evaluation and grading.",
  "Availability for doubt clearing and mentoring.",
  "Use of innovative teaching methods and technology.",
  "Coverage of syllabus and depth of topics discussed.",
  "Ability to relate theory with practical applications.",
  "Overall effectiveness and impact as an educator."
];

export const MENTORS_LIST = [
  { id: '001', name: 'Ms. D Sujeetha', dept: Department.CSE },
  { id: '002', name: 'Ms. S Priya', dept: Department.CSE },
  { id: '003', name: 'Dr. Rajesh K', dept: Department.ECE },
  { id: '004', name: 'Prof. Lakshmi N', dept: Department.EEE },
  { id: '005', name: 'Dr. Arun M', dept: Department.MECH },
  { id: '006', name: 'Ms. Kavitha S', dept: Department.IT },
];

export const SUBJECTS_LIST = [
  { code: 'CS401', name: 'Compiler Design', dept: Department.CSE, mentorId: '002' },
  { code: 'CS101', name: 'Introduction to Programming', dept: Department.CSE, mentorId: '001' },
  { code: 'EC202', name: 'Digital Electronics', dept: Department.ECE, mentorId: '003' },
  { code: 'EE301', name: 'Control Systems', dept: Department.EEE, mentorId: '004' },
  { code: 'ME205', name: 'Fluid Mechanics', dept: Department.MECH, mentorId: '005' },
  { code: 'IT402', name: 'Web Technology', dept: Department.IT, mentorId: '006' },
];

export const STUDENT_SUBJECT_MAPPING: Record<string, string[]> = {
  '721423104056': ['CS401', 'CS101'],
  '721423104044': ['CS401', 'CS101'],
  '721423104006': ['CS401', 'CS101'],
  '721423104015': ['CS401', 'CS101'],
};
