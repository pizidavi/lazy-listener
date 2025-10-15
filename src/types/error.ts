import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class Exception extends HTTPException {
  /**
   * Creates an instance of `HTTPException`.
   * @param status - HTTP status code for the exception. Defaults to 500.
   */
  constructor(status: ContentfulStatusCode, message?: string) {
    super(status, { message });
  }
}
