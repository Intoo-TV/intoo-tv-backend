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
    this._router.get("/", passport.authenticate('jwt', { session: false }), this.experienceController.get);
    this._router.post("/", passport.authenticate('jwt', { session: false }), this.experienceController.postNFT);
    this._router.post("/:experienceID/reserve", passport.authenticate('jwt', { session: false }), this.experienceController.reserve);
    this._router.post("/:experienceID/start", passport.authenticate('jwt', { session: false }), this.experienceController.start);
    this._router.post("/:experienceID/rate", passport.authenticate('jwt', { session: false }), this.experienceController.rate);
    this._router.post("/:experienceID/createAccess", passport.authenticate('jwt', { session: false }), this.experienceController.postAccessToEvent);
    this._router.post("/:experienceID/expire", passport.authenticate('jwt', { session: false }), this.experienceController.expireExperience);
  }

  public get router(): Router {
    return this._router;
  }
}
