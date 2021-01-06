import * as bcrypt from 'bcrypt';
import { Response } from "express";
import { TokenData, User, UserSchema } from '../models/user';
import { injectable } from "inversify";
import { createToken } from '../services/auth.service';

@injectable()
export class UserController {

    public post = async (req: any, res: Response) => {
        try {
            const userData: User = req.body;
            if (await UserSchema.findOne({ email: userData.email })) {
                res.status(400).send({ error: "User with this email is already registered." });
            } else if (await UserSchema.findOne({ ethAddress: userData.ethAddress })) {
                res.status(400).send({ error: "User with this ether address is already registered." });
            } else {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                userData.password = undefined;
                userData.tokenIDs = [];
                const user = await UserSchema.create({
                    ...userData,
                    password: hashedPassword,
                });
                user.password = undefined;
                res.status(201).send(user);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public put = async (req: any, res: Response) => {
        try {
            const userData: User = req.body;
            const user = await UserSchema.findOne({ email: req.user.email });
            const updated = await UserSchema.findOneAndUpdate({ email: req.user.email }, {
                balance: userData.balance ? userData.balance : user.balance,
                nickname: userData.nickname ? userData.nickname : user.nickname,
                interests: userData.interests,
                favoritePlaces: userData.favoritePlaces
            });
            updated.password = undefined;

            res.status(200).send(updated);

        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }


    public get = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            user.password = undefined;
            res.status(200).send(user);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }



    public login = async (req: any, res: Response) => {
        try {
            const logInData = req.body;
            const user = await UserSchema.findOne({ email: logInData.email });
            if (user) {
                const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
                if (isPasswordMatching) {
                    user.password = undefined;
                    const tokenData = createToken(user);
                    res.status(200).send(tokenData);
                } else {
                    res.status(401).send({ error: "Invalid user email." });
                }
            } else {
                res.status(401).send({ error: "Invalid credentials." });
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public getBalance = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ ethAddress: req.params.ethAddress });
            res.status(200).send({ balance: user.balance })
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public addTokenID = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            user.tokenIDs.push({tokenID: req.body.tokenID, active: true });
            user.save();
            res.status(200).send();
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }
}

