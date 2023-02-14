// noinspection DuplicatedCode
// duplicated code for standard iron-session and iron-session/edge

import { unsealData, sealData } from 'iron-session';
import config from '../../config';
import { EncryptionUtils, FronteggUserTokens } from '../createSession/types';

const unsealTokens = async (data: string): Promise<FronteggUserTokens | undefined> => {
  const jwtData: string = await unsealData(data, {
    password: config.password,
  });
  return JSON.parse(jwtData);
};

const sealTokens = async (tokens: FronteggUserTokens, ttl: number): Promise<string> => {
  const dataToSeal = JSON.stringify(tokens);
  return sealData(dataToSeal, {
    password: config.password,
    ttl,
  });
};

const encryptionUtils: EncryptionUtils = {
  unsealTokens,
  sealTokens,
};

export default encryptionUtils;
