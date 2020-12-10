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
    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
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
                    res.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
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

            const user: User = req.user;
            const ethAddr: string = req.params.ethAddress;
            if (user.ethAddress !== ethAddr) {
                res.status(403).send({ error: 'You do not have access to the balance of this address' });
            } else {
                res.status(200).send({ balance: user.balance })
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }
}

