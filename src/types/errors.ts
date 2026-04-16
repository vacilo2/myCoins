export type ErrorCode =
  | 'FETCH_FAILED'
  | 'SYNC_FAILED'
  | 'DELETE_FAILED'
  | 'AUTH_REQUIRED'
  | 'NETWORK_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;   // mensagem amigável para exibir ao usuário
  raw?: unknown;     // erro original para debug
}
