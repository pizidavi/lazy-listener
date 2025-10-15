/* eslint-disable @typescript-eslint/consistent-type-definitions */

interface PromiseLike<T> {
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<U>(
    onfulfilled: (value: T) => U | PromiseLike<U>,
    onrejected?: ((reason: unknown) => U | PromiseLike<U>) | null,
  ): PromiseLike<U>;

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<U>(
    onfulfilled: ((value: T) => U | PromiseLike<U>) | null | undefined,
    onrejected?: ((reason: unknown) => U | PromiseLike<U>) | null,
  ): PromiseLike<T | U>;
}

interface Promise<T> extends PromiseLike<T> {
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<U>(
    onfulfilled: (value: T) => U | PromiseLike<U>,
    onrejected?: ((reason: unknown) => U | PromiseLike<U>) | null,
  ): Promise<U>;

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<U>(
    onfulfilled: ((value: T) => U | PromiseLike<U>) | null | undefined,
    onrejected?: ((reason: unknown) => U | PromiseLike<U>) | null,
  ): Promise<T | U>;

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<U>(
    onrejected: ((reason: unknown) => U | PromiseLike<U>) | null | undefined,
  ): Promise<T | U>;
}
