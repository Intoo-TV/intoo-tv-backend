import { biconomyCall, createTicket, initialize } from "../contracts";
import { Response } from "express";
import { injectable } from "inversify";
import { CreateExperience, ExperienceNFT, ExperienceSchema, UserSchema } from "../models";
import {
    reserveExperience,
    LoggerService,
    rateExperience,
    startExperience,
    storeExperience,
    tip,
    validateExperience,
    storeJson,
} from "../services";

@injectable()
export class ExperienceController {

    constructor(
        private loggerService: LoggerService,
    ) {
    }

    public postNFT = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            if (!user) {
                return res.status(401).send({ error: "Unauthorized user! " });
            }
            const expModel = req.body as CreateExperience;
            const validationResult = validateExperience(expModel.nft);
            if (validationResult.isValid) {
                const url = await storeJson(expModel.nft);
                await createTicket(expModel.address,url.url, expModel.templateId, expModel.saveAsTemplate);
                // await biconomyCall(expModel.address,url.url, expModel.templateId, expModel.saveAsTemplate);
            } else {
                res.status(400).send(validationResult);
            }
            res.status(200).send({ message: "Ticket created!" });
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public post = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            if (!user) {
                return res.status(401).send({ error: "Unauthorized user! " });
            }
            const validationResult = validateExperience(req.body);
            if (validationResult.isValid) {
                const exp = await storeExperience(user.id, req.body);
                res.status(201).send({ id: exp.id });
            } else {
                res.status(400).send(validationResult);
            }
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public reserve = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            if (!user) {
                return res.status(401).send({ error: "Unauthorized user! " });
            }
            const guestID: string = user.id;

            const experienceID: string = req.params.experienceID;
            console.log(experienceID);
            const result = await reserveExperience(guestID, experienceID);
            if (result.isValid) {
                res.status(200).send();
            } else {
                res.status(400).send(result);
            }
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }
    public start = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            if (!user) {
                return res.status(401).send({ error: "Unauthorized user! " });
            }
            const guestID: string = user.id;

            const experienceID: string = req.params.experienceID;
            const result = await startExperience(guestID, experienceID);
            if (result.isValid) {
                res.status(200).send();
            } else {
                res.status(400).send(result);
            }
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public rate = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            if (!user) {
                return res.status(401).send({ error: "Unauthorized user! " });
            }
            const guestID: string = user.id;
            const experienceID: string = req.params.experienceID;
            const result = await rateExperience(guestID, experienceID, req.body.rate);
            if (result.isValid) {
                res.status(200).send();
            } else {
                res.status(400).send(result);
            }
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public get = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            if (!user) {
                return res.status(401).send({ error: "Unauthorized user! " });
            }
            const experiences = await ExperienceSchema.find({
                $and: [{ expired: false }, { $and: [{ hostID: { $ne: user.id } }, { guestID: undefined }] }]
            }).exec();
            res.status(200).send({ experiences });
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }
}

