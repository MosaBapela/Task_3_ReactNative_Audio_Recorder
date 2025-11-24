export interface VoiceNote {
  id: string;
  title: string;
  duration: number;
  date: Date;
  uri: string;
  fileSize: number;
}

export interface AppSettings {
  recordingQuality: 'low' | 'medium' | 'high';
  playbackSpeed: number;
  autoDelete: boolean;
  autoDeleteDays: number;
}