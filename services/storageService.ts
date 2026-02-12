
import { Complaint, EscalationLog } from '../types';

const STORAGE_KEY_COMPLAINTS = 'campuscare_complaints';
const STORAGE_KEY_LOGS = 'campuscare_escalation_logs';

export const saveComplaints = (complaints: Complaint[]) => {
  localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
};

export const getComplaints = (): Complaint[] => {
  const data = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
  return data ? JSON.parse(data) : [];
};

export const saveEscalationLogs = (logs: EscalationLog[]) => {
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
};

export const getEscalationLogs = (): EscalationLog[] => {
  const data = localStorage.getItem(STORAGE_KEY_LOGS);
  return data ? JSON.parse(data) : [];
};
