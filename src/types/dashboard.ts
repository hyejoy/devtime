/** --- Interfaces & Types --- */
export interface SummaryItem {
  title: string;
  value: number;
  type: 'time' | 'day' | 'percent';
}

export interface DisplayPart {
  value: number;
  unit: '시간' | '분' | '일째' | '%';
}

export interface FormattedData {
  title: string;
  parts: DisplayPart[];
}

export interface RawData {
  date: string;
  studyTimeHours: number;
  colorLevel: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type StudyLog = {
  completionRate: number;
  date: string;
  id: string;
  incompleteTasks: number;
  studyTime: number;
  todayGoal: string;
  totalTasks: number;
};

export interface StudyLogsResponse {
  pagination: Pagination;
  studyLogs: StudyLog[];
}
