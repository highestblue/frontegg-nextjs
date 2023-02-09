export enum EnvVariables {
  /**
   * The AppUrl is to tell Frontegg your application's app url
   * for generating cookies and proxy http requests
   */
  FRONTEGG_APP_URL = 'FRONTEGG_APP_URL',
  /**
   * The Frontegg domain is your unique URL to connect to the Frontegg gateway, get it by visit:
   * - For Dev environment [visit](https://portal.frontegg.com/development/settings/domains)
   * - For Prod environment [visit](https://portal.frontegg.com/production/settings/domains)
   */
  FRONTEGG_BASE_URL = 'FRONTEGG_BASE_URL',
  /**
   * The Frontegg test domain used for testing proxy middleware
   * @private for Frontegg
   */
  FRONTEGG_TEST_URL = 'FRONTEGG_TEST_URL',

  /**
   * Your Frontegg application's Client ID, get it by visit:
   * - For Dev environment [visit](https://portal.frontegg.com/development/settings/general)
   * - For Prod environment [visit](https://portal.frontegg.com/production/settings/general)
   */
  FRONTEGG_CLIENT_ID = 'FRONTEGG_CLIENT_ID',

  /**
   * The stateless session encryption password, used to encrypt
   * JWT before sending it to the client side.
   *
   * For quick password generation use the following command:
   *
   * ```sh
   *   node -e "console.log(crypto.randomBytes(32).toString('hex'))"
   * ```
   */
  FRONTEGG_ENCRYPTION_PASSWORD = 'FRONTEGG_ENCRYPTION_PASSWORD',

  /**
   * The stateless cookie name for storing the encrypted JWT
   * value as session cookies for supporting getServerSideProps and ServerComponents
   */
  FRONTEGG_COOKIE_NAME = 'FRONTEGG_COOKIE_NAME',

  /**
   * This Env variable assign automatically when deploying you Next.js application
   * to Vercel deployments service, and will be used to detect to dynamically configure
   * the {@link EnvVariables.FRONTEGG_APP_URL}
   *
   * @see [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables)
   */
  VERCEL = 'VERCEL',
  VERCEL_URL = 'VERCEL_URL',
}
