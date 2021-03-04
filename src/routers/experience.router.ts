import { injectable } from "inversify";
import { Router } from "express";
import { ExperienceController } from "../controllers";
const passport = require("passport");

@injectable()
export class ExperienceRouter {
  private readonly _router: Router;

  constructor(private experienceController: ExperienceController) {
    this._router = Router({ strict: true });
    this.init();
  }

  private init(): void {
    this._router.post("/",passport.authenticate('jwt', {session: false}), this.experienceController.post);
    this._router.get("/",passport.authenticate('jwt', {session: false}), this.experienceController.get);
    this._router.post("/nft",passport.authenticate('jwt', {session: false}), this.experienceController.postNFT);
    this._router.post("/:experienceID/buy",passport.authenticate('jwt', {session: false}), this.experienceController.buy);
    this._router.post("/:experienceID/start",passport.authenticate('jwt', {session: false}), this.experienceController.start);
    this._router.post("/:experienceID/rate",passport.authenticate('jwt', {session: false}), this.experienceController.rate);
  }

  public get router(): Router {
    return this._router;
  }
}
