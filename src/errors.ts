export class BrawlStarsAPIError extends Error {
    statusCode: number;
    endpoint: string;

    constructor(message: string, statusCode: number, endpoint: string) {
        super(message);
        this.name = 'BrawlStarsAPIError';
        this.statusCode = statusCode;
        this.endpoint = endpoint;
    }
}
