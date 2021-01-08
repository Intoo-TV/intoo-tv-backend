import * as bcrypt from 'bcrypt';
import * as express from 'express';
import { Response } from "express";
import { TokenData, User, UserSchema } from '../models/user';
import { injectable } from "inversify";
import { createToken } from '../services/auth.service';
import { bucketsPullPathAccessRoles } from '@textile/hub';
import { InterestSchema, PlaceSchema } from '../models';

@injectable()
export class GeneralController {

    public getFavoritePlaces = async (req: any, res: any) => {
        const places = await PlaceSchema.find()
        res.status(200).send({places: places});
    }
    public getInterests = async (req: any, res: any) => {
        const interests = await InterestSchema.find()
        res.status(200).send({interests: interests});
    }

}

