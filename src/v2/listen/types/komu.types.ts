export interface KomuPreferences {
  project?: {
    label: string;
    value: string;
  };
  task?: {
    label: string;
    value: string;
  };
  'type of work'?: {
    label: string;
  };
  'working time'?: number;
}

export interface KomuOutputData {
  date?: Date | null;
  yesterday?: string;
  today?: string;
  block?: string;
  'working time'?: string;
}

export interface KomuMessageData {
  message_id: string;
  channel_id: string;
  clan_id: string;
  sender_id?: string;
  display_name?: string;
  member?: string;
}

export type MessageType = 'reply' | 'update' | 'unknown';
