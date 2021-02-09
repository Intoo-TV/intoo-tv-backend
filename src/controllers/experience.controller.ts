import { Response } from "express";
import { injectable } from "inversify";
import { ExperienceSchema } from "../models";
import { LoggerService, storeNFT, storeTokenIDNFTUrl, validateExperience, validateTokenID } from "../services";

@injectable()
export class ExperienceController {

    constructor(
        private loggerService: LoggerService,
    ) {
    }


    public post = async (req: any, res: Response) => {
        try {
            const validationResult = validateExperience(req.body);
            if (validationResult.isValid) {
                const url = await storeNFT(req.body.tokenID, {
                    title: req.body.title,
                    properties: req.body.properties,
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


    public postTokenID = async (req: any, res: Response) => {
        try {
            const validationResult = validateTokenID(req.body);
            if (validationResult.isValid) {
                const url = await storeTokenIDNFTUrl(req.body.tokenID, req.body.url);
                res.status(201).send();
            } else {
                res.status(400).send(validationResult);
            }
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }


    public get = async (req: any, res: Response) => {
        try {
            const past: boolean = req.query.past === 'true';
            const experiences = await ExperienceSchema.find({ expired: past }).exec();
            res.status(200).send({ experiences });
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }
}

