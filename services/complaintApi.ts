import { Complaint, ComplaintCategory, ComplaintStatus, Department, StudentDept } from '../types';

const COMPLAINTS_API_URL = 'http://localhost:8080/api/complaints';

const normalizeComplaint = (complaint: Partial<Complaint>): Complaint => ({
  id: String(complaint.id ?? ''),
  studentId: complaint.studentId ?? '',
  studentName: complaint.studentName ?? '',
  studentDept: complaint.studentDept ?? StudentDept.CSE,
  title: complaint.title ?? '',
  description: complaint.description ?? '',
  category: complaint.category ?? ComplaintCategory.OTHERS,
  priority: complaint.priority ?? 'MEDIUM',
  status: complaint.status ?? ComplaintStatus.PENDING,
  department: complaint.department ?? Department.ADMINISTRATION,
  createdAt: complaint.createdAt ?? new Date().toISOString(),
  updatedAt: complaint.updatedAt ?? complaint.createdAt ?? new Date().toISOString(),
  escalatedToAdmin: complaint.escalatedToAdmin ?? false,
  escalatedToHOD: complaint.escalatedToHOD ?? false,
  resolvedByRole: complaint.resolvedByRole,
  feedback: complaint.feedback,
  adminRemarks: complaint.adminRemarks,
  mentorRemarks: complaint.mentorRemarks,
  imageUrl: complaint.imageUrl,
  statusHistory: complaint.statusHistory ?? []
});

export const fetchComplaints = async (): Promise<Complaint[]> => {
  const response = await fetch(COMPLAINTS_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch complaints: ${response.status}`);
  }

  const data = (await response.json()) as Partial<Complaint>[];
  return data.map(normalizeComplaint);
};

export const createComplaint = async (complaint: Complaint): Promise<Complaint> => {
  const { id: _id, ...complaintWithoutId } = complaint;

  const response = await fetch(COMPLAINTS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(complaintWithoutId)
  });

  if (!response.ok) {
    throw new Error(`Failed to create complaint: ${response.status}`);
  }

  return normalizeComplaint(await response.json());
};

export const updateComplaint = async (complaint: Complaint): Promise<Complaint> => {
  const response = await fetch(`${COMPLAINTS_API_URL}/${complaint.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(complaint)
  });

  if (!response.ok) {
    throw new Error(`Failed to update complaint: ${response.status}`);
  }

  return normalizeComplaint(await response.json());
};

export const deleteComplaint = async (complaintId: string): Promise<void> => {
  const response = await fetch(`${COMPLAINTS_API_URL}/${complaintId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(`Failed to delete complaint: ${response.status}`);
  }
};
