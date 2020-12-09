import { injectable } from "inversify";
import { Router } from "express";
import { GeneralController } from "../controllers";
const passport = require("passport");

@injectable()
export class GeneralDataRouter {
  private readonly _router: Router;

  constructor(private generalController: GeneralController) {
    this._router = Router({ strict: true });
    this.init();
  }

  private init(): void {
    this._router.get("/places", passport.authenticate('jwt', {session: false}), this.generalController.getFavoritePlaces);
    this._router.get("/interests", passport.authenticate('jwt', {session: false}), this.generalController.getInterests);
  }

  public get router(): Router {
    return this._router;
  }
}
