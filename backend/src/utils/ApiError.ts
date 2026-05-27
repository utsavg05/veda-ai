export class ApiError extends Error {
	public statusCode: number;

	public success: false;

	public errors?: unknown;

	constructor(statusCode: number, message: string, errors?: unknown) {
		super(message);
		this.statusCode = statusCode;
		this.success = false;
		this.errors = errors;

		Object.setPrototypeOf(this, ApiError.prototype);
		Error.captureStackTrace?.(this, this.constructor);
	}
}
