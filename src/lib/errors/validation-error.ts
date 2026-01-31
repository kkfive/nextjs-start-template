import type { AppErrorOptions } from './app-error'
import { AppError } from './app-error'

export interface FieldError {
  field: string
  message: string
  code?: string
}

export interface ValidationErrorOptions extends AppErrorOptions {
  fields?: FieldError[]
}

export class ValidationError extends AppError {
  public readonly fields: FieldError[]

  constructor(message: string, options?: ValidationErrorOptions) {
    super(message, options)
    Object.defineProperty(this, 'name', { value: 'ValidationError', writable: false })
    this.fields = options?.fields ?? []
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields,
    }
  }

  getFieldError(field: string): FieldError | undefined {
    return this.fields.find(f => f.field === field)
  }

  hasFieldError(field: string): boolean {
    return this.fields.some(f => f.field === field)
  }
}
