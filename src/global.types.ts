export interface TaskDoneRecord {
  groupId: number;
  groupName: string | null;
  userId: number;
  userName: string;
  textBeforeDone: string;
  timestamp: Date;
  messageHash: string;
}
