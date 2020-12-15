import { model, Model, Schema, Document } from "mongoose";
import { Request } from 'express';

export interface DataStoredInToken {
  _id: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}


export interface User {
  nickname: string;
  email: string;
  balance: number;
  password: string;
  ethAddress: string;
  interests: string[];
  favoritePlaces: string[];
}
export interface UserModel extends User, Document { }

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  ethAddress: {
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    required: false,
  },
  balance: {
    type: Number,
    required: true,
    default: 10,
  },

  interests: {
    type: Array,
    required: false,
    default: []
  },
  favoritePlaces: {
    type: Array,
    required: false,
    default: []
  }
});

export const UserSchema: Model<UserModel> = model<UserModel>("users", userSchema);
