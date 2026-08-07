import { ApplicationError } from './ApplicationError';

export function mapApplicationError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return new ApplicationError(
      'STORAGE_QUOTA_EXCEEDED',
      'O navegador não possui espaço suficiente para salvar este monstro.'
    );
  }

  return new ApplicationError(
    'UNEXPECTED',
    'Não foi possível concluir a operação. Tente novamente.'
  );
}
