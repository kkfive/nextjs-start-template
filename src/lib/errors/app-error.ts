export interface AppErrorOptions {
  cause?: Error
  context?: Record<string, unknown>
}

export class AppError extends Error {
  public readonly name = 'AppError'
  public readonly context?: Record<string, unknown>

  constructor(message: string, options?: AppErrorOptions) {
    super(message, { cause: options?.cause })
    this.context = options?.context
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      cause: this.cause instanceof Error ? this.cause.message : undefined,
    }
  }
}
