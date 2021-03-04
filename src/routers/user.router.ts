import { injectable } from "inversify";
import { Router } from "express";
import { UserController } from "../controllers";
const passport = require("passport");

@injectable()
export class UserRouter {
  private readonly _router: Router;

  constructor(private userController: UserController) {
    this._router = Router({ strict: true });
    this.init();
  }

  private init(): void {
    this._router.post("/", this.userController.post);
    this._router.put("/", passport.authenticate('jwt', {session: false}), this.userController.put);
    this._router.get("/", passport.authenticate('jwt', {session: false}), this.userController.get);
    this._router.post("/login", this.userController.login);
    this._router.get("/experiences",passport.authenticate('jwt', {session: false}), this.userController.getExperiences);
    this._router.get("/:ethAddress/balance", this.userController.getBalance);
  }

  public get router(): Router {
    return this._router;
  }
}
