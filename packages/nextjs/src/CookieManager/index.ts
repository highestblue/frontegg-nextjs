import cookie, { CookieSerializeOptions } from 'cookie';
import { RequestCookie } from 'next/dist/server/web/spec-extension/cookies';
import FronteggConfig from '../utils/FronteggConfig';
import { CreateCookieOptions, RemoveCookiesArguments, RequestType } from './types';
import { COOKIE_MAX_LENGTH } from './constants';
import {
  getCookieHeader,
  getIndexedCookieName,
  getRefreshTokenCookieNameVariants,
  splitValueToChunks
} from "./helpers";
import FronteggLogger from '../FronteggLogger';

class CookieManager {
  getCookieName = (cookieNumber?: number, cookieName = FronteggConfig.cookieName) =>
    cookieNumber ? `${cookieName}-${cookieNumber}` : cookieName;

  /**
   * Validate and create new cookie headers.
   * The default value of `cookieName` is {@link FronteggConfig.cookieName}
   * @param {CreateCookieOptions} options - Create cookie options
   */
  create(options: CreateCookieOptions) {
    const logger = FronteggLogger.child({ tag: 'CookieManager.create' });
    const cookieName = options.cookieName ?? FronteggConfig.cookieName;
    const cookieValue = options.value;
    logger.info(`Creating new cookie for '${cookieName}'`);

    const serializeOptions: CookieSerializeOptions = {
      expires: options.expires,
      httpOnly: options.httpOnly ?? true,
      domain: options.domain ?? FronteggConfig.cookieDomain,
      path: options.path ?? '/',
      priority: 'high',
    };

    if (options.secure) {
      logger.verbose(`Set cookie '${cookieName}' as secure`);
      serializeOptions.secure = options.secure;
      serializeOptions.sameSite = 'none';
    }

    const indexedCookieName = getIndexedCookieName(1, cookieName);
    const serializedCookie = cookie.serialize(indexedCookieName, cookieValue, options);

    if (serializedCookie.length <= COOKIE_MAX_LENGTH) {
      logger.info(`Successfully create a cookie header, '${cookieName}'`);
      return [serializedCookie];
    } else {
      logger.verbose('Going to split cookie into chunks');
      /** Create chunked cookie headers and store value as array of headers */
      const cookies = splitValueToChunks(cookieName, cookieValue, options);
      logger.info(`Successfully create chunked cookie headers, '${cookieName}' (count: ${cookies.length})`);
      return cookies;
    }
  }

  /**
   * Loop over cookie headers, extract, parse cookies and merged divided cookies from incoming http request,
   * @return full session cookie headers if exists, else return undefined
   * @param {RequestType} request - Incoming HTTP Request
   */
  getSessionCookieFromRequest(request?: RequestType): string | undefined {
    const logger = FronteggLogger.child({ tag: 'CookieManager.getSessionCookieFromRequest' });
    logger.info('Going to extract session cookies header from request');

    if (!request) {
      logger.info(`'request' argument is null, Cookie header not found`);
      return undefined;
    }

    const cookieStr = getCookieHeader(request);

    logger.verbose('Parsing cookie header string');
    const cookies = cookie.parse(cookieStr);

    logger.verbose('Loop over session cookie headers');
    let i = 1;
    let sessionCookies = '';
    let sessionCookieChunk: string | undefined;
    do {
      sessionCookieChunk = cookies[getIndexedCookieName(i++)];
      sessionCookies += sessionCookieChunk;
    } while (!sessionCookieChunk);

    if (sessionCookies.length > 0) {
      logger.info('Session cookie NOT found');
      return undefined;
    }

    logger.info(`Session cookie found, (count: ${i})`);
    return sessionCookies;
  }

  parseCookieFromArray(cookies: RequestCookie[]): string | undefined {
    const cookieChunks = cookies.filter((c) => c.name.includes(this.getCookieName()));
    if (!cookieChunks) {
      return undefined;
    }
    cookieChunks.sort((a, b) => {
      const firstCookieNumber = parseInt(a.name.slice(-1));
      const secondCookieNumber = parseInt(b.name.slice(-1));
      return firstCookieNumber > secondCookieNumber ? 1 : -1;
    });
    return cookieChunks.map((c) => c.value).join('');
  }

  createEmptySingleCookie = (cookieName: string, isSecured: boolean, cookieDomain: string) => {
    return this.create({ cookieName, value: '', expires: new Date(), secure: isSecured, domain: cookieDomain });
  };

  createEmptyCookies = (isSecured: boolean, cookieDomain: string, _cookiesToRemove: string[]): string[] => {
    const allEmptyCookies: string[] = [];

    const refreshTokenVariants = getRefreshTokenCookieNameVariants();
    const cookiesToRemove = [..._cookiesToRemove, ...refreshTokenVariants];

    cookiesToRemove.forEach((name: string) => {
      allEmptyCookies.push(...this.createEmptySingleCookie(name, isSecured, cookieDomain));
    });

    return allEmptyCookies;
  };

  getCookiesToRemove = (request?: RequestType): string[] => {
    if (!request) {
      return [];
    }
    try {
      const cookieStr = getCookieHeader(request);
      const cookies = cookieStr && cookie.parse(cookieStr);
      if (!cookies) {
        return [];
      }
      let cookieNumber = 1;
      const cookieToRemove = [];
      while (cookies[this.getCookieName(cookieNumber)]) {
        cookieToRemove.push(this.getCookieName(cookieNumber));
        cookieNumber++;
      }
      return cookieToRemove;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  removeCookies({ cookieNames, isSecured, cookieDomain, res, req }: RemoveCookiesArguments): void {
    const cookiesToRemove = this.getCookiesToRemove(req);
    const cookieValue = this.createEmptyCookies(isSecured, cookieDomain, cookieNames ?? cookiesToRemove);
    let existingSetCookie = (res.getHeader('set-cookie') as string[] | string) ?? [];
    if (typeof existingSetCookie === 'string') {
      existingSetCookie = [existingSetCookie];
    }
    res.setHeader('set-cookie', [...existingSetCookie, ...cookieValue]);
  }

  modifySetCookie = (setCookieValue: string[] | undefined, isSecured: boolean): string[] | undefined => {
    if (!setCookieValue) {
      return setCookieValue;
    }
    if (setCookieValue.length > 0) {
      return setCookieValue.map((c) => {
        let cookie = c.split('; ');

        if (!isSecured) {
          cookie = cookie.filter((property) => property !== 'Secure' && property !== 'SameSite=None');
        }

        return (
          cookie
            .map((property) => {
              if (property.toLowerCase() === `domain=${FronteggConfig.baseUrlHost}`) {
                return `Domain=${FronteggConfig.cookieDomain}`;
              }
              return property;
            })
            .join(';') + ';'
        );
      });
    }
    return setCookieValue;
  };
}

export default new CookieManager();
