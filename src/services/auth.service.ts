import { DataStoredInToken, TokenData, UserModel } from "../models";
import * as jwt from 'jsonwebtoken';

export function createToken(user: UserModel): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = 'secret';
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }