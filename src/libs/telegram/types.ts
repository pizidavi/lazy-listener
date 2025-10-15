export type TelegramResponse<T = unknown> =
  | {
      ok: false;
      description?: string;
    }
  | {
      ok: true;
      result: T;
      description?: string;
    };

export type TelegramFile = {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
};

export type TelegramChatMember = {
  status: 'administrator' | 'creator' | (string & {});
  user: {
    id: number;
  };
};
