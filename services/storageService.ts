
import { EscalationLog, ReviewWindow, TeachingReview, InstitutionalReport } from '../types';

const STORAGE_KEY_LOGS = 'campuscare_escalation_logs';

const readJson = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Invalid localStorage data for ${key}. Resetting to fallback value.`, error);
    localStorage.removeItem(key);
    return fallback;
  }
};

export const saveEscalationLogs = (logs: EscalationLog[]) => {
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
};

export const getEscalationLogs = (): EscalationLog[] => {
  return readJson(STORAGE_KEY_LOGS, []);
};

export const getReviewWindows = (): ReviewWindow[] => {
  return readJson('campuscare_review_windows', []);
};

export const saveReviewWindows = (windows: ReviewWindow[]) => {
  localStorage.setItem('campuscare_review_windows', JSON.stringify(windows));
};

export const getTeachingReviews = (): TeachingReview[] => {
  return readJson('campuscare_teaching_reviews', []);
};

export const saveTeachingReviews = (reviews: TeachingReview[]) => {
  localStorage.setItem('campuscare_teaching_reviews', JSON.stringify(reviews));
};

export const getInstitutionalReports = (): InstitutionalReport[] => {
  return readJson('campuscare_institutional_reports', []);
};

export const saveInstitutionalReports = (reports: InstitutionalReport[]) => {
  localStorage.setItem('campuscare_institutional_reports', JSON.stringify(reports));
};

export const hasStudentSubmitted = (studentId: string, mentorId: string, semesterId: string): boolean => {
  const reviews = getTeachingReviews();
  return reviews.some(r => r.studentId === studentId && r.mentorId === mentorId && r.semesterId === semesterId);
};
