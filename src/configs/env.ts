import { envSchema } from '../types/schema';

export const env = (() => {
  const _ = envSchema.safeParse(
    //@ts-expect-error wrangler defines process.env
    process.env,
  );
  if (!_.success) throw new Error(`Invalid environment variables: ${_.error.message}`);

  return _.data;
})();
