/**
 * Error class for Codes API errors
 */
export class CodesApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public action?: string,
	) {
		super(message);
		this.name = "CodesApiError";
	}

	toJSON() {
		return {
			name: this.name,
			status: this.status,
			message: this.message,
			action: this.action,
		};
	}
}
