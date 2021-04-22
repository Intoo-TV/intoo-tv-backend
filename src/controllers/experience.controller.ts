import * as contracts from "../contracts";
import { Response } from "express";
import { injectable } from "inversify";
import {
    CreateExperience,
    ExperienceSchema,
    UserSchema
} from "../models";
import {
    reserveExperience,
    LoggerService,
    rateExperience,
    startExperience,
    storeExperience,
    validateExperience,
    storeJson,
    getOpenExperiences,
    getStreamUrl,
    generateStreamUrl,
    getExperienceByID,
} from "../services";

@injectable()
export class ExperienceController {

    constructor(
        private loggerService: LoggerService,
    ) {
    }

    public post = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            if (!user) {
                return res.status(401).send({ error: "Unauthorized user! " });
            }
            const expModel = req.body as CreateExperience;
            const validationResult = validateExperience(expModel.nft);
            if (validationResult.isValid) {
                const url = await storeJson(expModel.nft);
                const tokenId = await contracts.createTicket(user.ethAddress, url, expModel.templateId, expModel.saveAsTemplate);
                storeExperience(user.id, {
                    tokenID: +tokenId,
                    start: expModel.nft.start,
                    duration: expModel.nft.duration,
                    hostID: user.id,
                    guestID: undefined,
                    expired: false
                })
                res.status(200).send({ url });
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
            const hostID: string = user.id;

            const experienceID: string = req.params.experienceID;
            const result = await startExperience(hostID, experienceID);

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

            const experiences = await getOpenExperiences(user.id);
            res.status(200).send({ experiences });
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }


    public getByID = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            if (!user) {
                return res.status(401).send({ error: "Unauthorized user! " });
            }
            const experienceID: string = req.params.experienceID;
            const experience = await getExperienceByID(experienceID);
            res.status(200).send(experience);
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }

    public generateStream = async (req: any, res: Response) => {
        try {
            const experienceID: string = req.params.experienceID;

            const stream = await generateStreamUrl(experienceID);
            res.status(200).send({ stream });
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }


    public getStream = async (req: any, res: Response) => {
        try {
            const experienceID: string = req.params.experienceID;
            const stream = await getStreamUrl(experienceID);
            res.status(200).send({ stream });
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }
}

