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
    this._router.post("/login", this.userController.login);
    this._router.get("/", passport.authenticate('jwt', {session: false}), this.userController.get);
  }

  public get router(): Router {
    return this._router;
  }
}