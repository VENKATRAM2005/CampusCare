
export enum Role {
  STUDENT = 'STUDENT',
  STAFF = 'STAFF',
  HOD = 'HOD',
  ADMIN = 'ADMIN'
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED'
}

export enum ComplaintCategory {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  ACADEMICS = 'ACADEMICS',
  RAGGING = 'RAGGING',
  STAFF_RELATED = 'STAFF_RELATED',
  OTHERS = 'OTHERS'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum Department {
  MAINTENANCE = 'MAINTENANCE',
  ANTI_RAGGING = 'ANTI_RAGGING',
  ADMINISTRATION = 'ADMINISTRATION',
  CSE = 'CSE',
  ECE = 'ECE',
  EEE = 'EEE',
  MECH = 'MECH',
  CIVIL = 'CIVIL',
  AIDS = 'AIDS',
  CSBS = 'CSBS',
  IT = 'IT'
}

export enum StudentDept {
  CSE = 'CSE',
  ECE = 'ECE',
  EEE = 'EEE',
  MECH = 'MECH',
  CIVIL = 'CIVIL',
  AIDS = 'AIDS',
  CSBS = 'CSBS',
  IT = 'IT'
}

export interface EscalationLog {
  id: string;
  complaintId: string;
  escalatedBy: string;
  reason: string;
  timestamp: string;
  targetRole: Role;
}

export interface Feedback {
  rating: number;
  comment: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  studentDept: StudentDept;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: Priority;
  status: ComplaintStatus;
  department: Department;
  createdAt: string;
  updatedAt: string;
  escalatedToAdmin: boolean;
  escalatedToHOD: boolean;
  resolvedByRole?: Role;
  feedback?: Feedback;
  adminRemarks?: string;
  staffRemarks?: string;
}

export interface UserSession {
  id: string;
  name: string;
  role: Role;
  department?: Department;
}
