import * as bcrypt from 'bcrypt';
import { User, UserSchema } from '../models/user';
import { injectable } from "inversify";
import { addToWhitelist } from "../contracts";
import { ExperienceSchema } from '../models';
import { tip, createToken, getUserExperiences } from '../services';
require('dotenv').config()

const jwt = require('jsonwebtoken');
const algorithm = { algorithm: "HS256" };
@injectable()
export class UserController {

    public post = async (req: any, res: any) => {
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
                addToWhitelist(userData.ethAddress);

                user.password = undefined;
                res.status(201).send(user);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public put = async (req: any, res: any) => {
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


    public get = async (req: any, res: any) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            user.password = undefined;
            res.status(200).send(user);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }



    public login = async (req: any, res: any) => {
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

    public getBalance = async (req: any, res: any) => {
        try {
            const user = await UserSchema.findOne({ ethAddress: req.params.ethAddress });
            res.status(200).send({ balance: user.balance })
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public getExperiences = async (req: any, res: any) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            const past: boolean = req.query.past === 'true';
            if (user) {
                const experiences = await getUserExperiences(user.id, past);
                return res.status(200).send({ experiences });
            } else {
                return res.status(401).send({ error: "Unauthorized user." })
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }
    public tipUser = async (req: any, res: any) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            if (!user) {
                return res.status(401).send({ error: "Unauthorized user! " });
            }
            const result = await tip(user.id, req.body.userID, req.body.amount);
            if (result.isValid) {
                res.status(200).send();
            } else {
                res.status(400).send(result);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public getThetaAccessToken = async (req: any, res: any) => {
        const user = await UserSchema.findOne({ email: req.user.email });
        if (!user) {
            return res.status(401).send({ error: "Unauthorized user! " });
        }
        let expiration = new Date().getTime() / 1000;
        console.log()
        expiration += 4320; // 3 days
        let payload = {
            api_key: process.env.THETA_API_KEY,
            user_id: user.id,
            iss: "auth0",
            exp: expiration
        };
        const accessToken = jwt.sign(payload, process.env.THETA_API_SECRET, algorithm);
        res.status(200).send({ accessToken });

    }
}

