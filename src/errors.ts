export class BrawlStarsAPIError extends Error {
  readonly statusCode?: number;
  readonly endpoint: string;
  readonly method: string;
  readonly retryable: boolean;
  readonly retryAfter?: number;

  constructor(
    message: string,
    endpoint: string,
    method?: string,
    statusCode?: number,
    options?: {
      retryable?: boolean;
      retryAfter?: number;
      cause?: unknown;
    }
  );
  constructor(message: string, statusCode: number, endpoint: string);
  constructor(
    message: string,
    endpointOrStatus: string | number,
    methodOrEndpoint = "GET",
    statusCode?: number,
    options: { retryable?: boolean; retryAfter?: number; cause?: unknown } = {}
  ) {
    super(message);
    if (options.cause !== undefined) {
      Object.defineProperty(this, "cause", { value: options.cause, enumerable: false });
    }
    this.name = "BrawlStarsAPIError";
    this.endpoint = typeof endpointOrStatus === "number" ? methodOrEndpoint : endpointOrStatus;
    this.method = typeof endpointOrStatus === "number" ? "GET" : methodOrEndpoint;
    this.statusCode = typeof endpointOrStatus === "number" ? endpointOrStatus : statusCode;
    this.retryable = options.retryable ?? false;
    this.retryAfter = options.retryAfter;
  }
}

export class AuthenticationError extends BrawlStarsAPIError {
  constructor(endpoint: string, method = "GET") {
    super("The Brawl Stars API token was rejected.", endpoint, method, 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends BrawlStarsAPIError {
  constructor(endpoint: string, method = "GET") {
    super("The request is not authorized for this API token.", endpoint, method, 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends BrawlStarsAPIError {
  constructor(endpoint: string, method = "GET") {
    super("The requested Brawl Stars resource was not found.", endpoint, method, 404);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends BrawlStarsAPIError {
  constructor(endpoint: string, retryAfter?: number, method = "GET") {
    super("The Brawl Stars API rate limit was exceeded.", endpoint, method, 429, {
      retryable: true,
      retryAfter
    });
    this.name = "RateLimitError";
  }
}

export class ServerError extends BrawlStarsAPIError {
  constructor(endpoint: string, statusCode: number, method = "GET", cause?: unknown) {
    super(`The Brawl Stars API returned server error ${statusCode}.`, endpoint, method, statusCode, {
      retryable: true,
      cause
    });
    this.name = "ServerError";
  }
}

export class RequestTimeoutError extends BrawlStarsAPIError {
  constructor(endpoint: string, timeout: number, method = "GET", cause?: unknown) {
    super(`The request timed out after ${timeout} ms.`, endpoint, method, undefined, {
      retryable: true,
      cause
    });
    this.name = "RequestTimeoutError";
  }
}

export class NetworkError extends BrawlStarsAPIError {
  constructor(endpoint: string, method = "GET", cause?: unknown) {
    super("The request could not reach the Brawl Stars API.", endpoint, method, undefined, {
      retryable: true,
      cause
    });
    this.name = "NetworkError";
  }
}

export class RequestAbortedError extends BrawlStarsAPIError {
  constructor(endpoint: string, method = "GET", cause?: unknown) {
    super("The request was aborted.", endpoint, method, undefined, { cause });
    this.name = "RequestAbortedError";
  }
}

export class ValidationError extends BrawlStarsAPIError {
  constructor(message: string) {
    super(message, "", "GET");
    this.name = "ValidationError";
  }
}
