
export enum Role {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
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
  MENTOR_RELATED = 'MENTOR_RELATED',
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

export interface StatusUpdate {
  status: ComplaintStatus;
  timestamp: string;
  updatedBy: string;
  remarks?: string;
}

export interface EscalationLog {
  id: string;
  complaintId: string;
  escalatedBy: string;
  reason: string;
  timestamp: string;
  targetRole?: Role;
  fromStatus?: ComplaintStatus;
  toStatus?: ComplaintStatus;
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
  mentorRemarks?: string;
  imageUrl?: string;
  statusHistory: StatusUpdate[];
}

// --- Teaching Review Module Types ---

export interface ReviewWindow {
  id: string;
  department: Department | 'INSTITUTIONAL';
  isOpen: boolean;
  semesterId: string;
  year: string;
  type: 'ODD' | 'EVEN';
  openedAt?: string;
  closedAt?: string;
}

export interface ModerationMetadata {
  sentimentScore: number;
  toxicityScore: number;
  isFlagged: boolean;
  confidenceScore: number;
  moderationNotes?: string;
  biasDetected: boolean;
  weightAdjustmentFactor: number;
}

export interface TeachingReview {
  id: string;
  studentId: string;
  studentName: string;
  semesterId: string;
  mentorId: string;
  mentorName: string;
  subjectCode: string;
  subjectName: string;
  ratings: number[]; // 10 ratings
  overallScore: number;
  writtenFeedback: string;
  moderation: ModerationMetadata;
  timestamp: string;
  hash: string;
}

export interface InstitutionalReport {
  id: string;
  semesterId: string;
  department?: Department | 'INSTITUTIONAL';
  generatedAt: string;
  content: string; // Markdown or JSON string from AI
  stats: {
    totalSubmissions: number;
    averageRating: number;
    deptStats: Record<string, number>;
    scoreDistribution: Record<number, number>;
  };
}

export interface UserSession {
  id: string;
  name: string;
  role: Role;
  department?: Department;
}
