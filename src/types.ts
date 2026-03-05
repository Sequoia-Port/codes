/**
 * Configuration for the Sequoia Codes public API client
 */
export interface SequoiaCodesClientConfig {
	/** API Key for authentication (SEQUOIA_CODES_API_KEY) */
	apiKey: string;
	/** Base URL (defaults to https://api.sequoiacodes.com) */
	baseUrl?: string;
	/** API version (defaults to v1) */
	version?: string;
}

/**
 * Standard API response envelope from the Codes API Gateway
 */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	version: string;
}
