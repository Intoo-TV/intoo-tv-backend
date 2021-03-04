import { Response } from "express";
import { injectable } from "inversify";
import { ExperienceNFT, ExperienceSchema, UserSchema } from "../models";
import {
    buyExperience,
    LoggerService,
    storeExperience,
    storeNFT,
    validateExperience,
    validateNFTProps,
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
            const nft = req.body as ExperienceNFT;
            const validationResult = validateNFTProps(nft);
            if (validationResult.isValid) {
                const url = await storeNFT({
                    title: nft.title,
                    properties: {
                        name: nft.properties.name,
                        description: nft.properties.description,
                        image: undefined
                    },
                });
                res.status(201).send(url);
            } else {
                res.status(400).send(validationResult);
            }
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

    public buy = async (req: any, res: Response) => {
        try {
            const user = await UserSchema.findOne({ email: req.user.email });
            if (!user) {
                return res.status(401).send({ error: "Unauthorized user! " });
            }
            const guestID: string = user.id;

            const experienceID: string = req.params.experienceID;
            console.log(experienceID);
            const result = await buyExperience(guestID, experienceID);
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

