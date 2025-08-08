// ⚠️ DEPRECATED: Supabase client is no longer used in this app
// All authentication and data operations now go through the backend API

console.warn('DEPRECATED: supabase.ts is no longer used. Use apiService instead.');

// Stub exports to prevent breaking imports during migration
export const supabase = null;
export const isSupabaseAvailable = false;

export class SupabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function withSupabaseErrorHandling<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  operationName: string = 'Supabase operation'
): Promise<T> {
  console.warn(`DEPRECATED: ${operationName} - Use apiService instead`);
  return Promise.resolve(fallbackValue);
}

export async function checkSupabaseHealth(): Promise<boolean> {
  console.warn('DEPRECATED: checkSupabaseHealth - Use apiService.checkHealth() instead');
  return false;
}