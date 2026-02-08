export type SplitTime = {
  date: string; // ISO
  timeSpent: number; // minutes
};

export type TimerState = {
  timerId: string;
  startTime: string;
  splitTimes: SplitTime[];
};

export interface timerSummary {
  review: string;
  tasks: {
    content: string;
    isCompleted: boolean;
  }[];
}
export type Task = {
  id: string;
  content: string;
  isCompleted: boolean;
};

export interface DisplayTime {
  hours: string;
  mins: string;
  secs: string;
}

export type TimerStatus = 'READY' | 'RUNNING' | 'DONE' | 'PAUSE';
