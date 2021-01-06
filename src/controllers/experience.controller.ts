import { Response } from "express";
import { injectable } from "inversify";
import { LoggerService, storeNFT, validateExperience } from "../services";

@injectable()
export class ExperienceController {

    constructor(
        private loggerService: LoggerService,
    ) {
    }

    /**
     * @swagger
     * /experience:
     *  push:
     *      description: Stores the NFT data on textile
     *      tags:
     *          - Experience
     *      parameters:
     *          - name: User
     *            type: User
     *            in: body
     *            schema:
     *               $ref: '#/definitions/CreateUser'
     *      produces:
     *          - application/json
     *      responses:
     *          201:
     *              description: OK
     *          500:
     *              description: Server error
     */
    public post = async (req: any, res: Response) => {
        try {
            const validationResult = validateExperience(req.body);
            if (validationResult.isValid) {
                const url = await storeNFT(req.body);
                res.status(201).send(url);
            } else {
                res.status(400).send(validationResult);
            }
        } catch (err) {
            this.loggerService.error(err);
            res.status(500).send({ error: "Something went wrong, please try again later." });
        }
    }
}

