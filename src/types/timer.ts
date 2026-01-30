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
