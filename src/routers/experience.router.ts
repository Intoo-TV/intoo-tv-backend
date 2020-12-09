import { injectable } from "inversify";
import { Router } from "express";
import { ExperienceController } from "../controllers";

@injectable()
export class ExperienceRouter {
  private readonly _router: Router;

  constructor(private experienceController: ExperienceController) {
    this._router = Router({ strict: true });
    this.init();
  }

  private init(): void {
    this._router.post("/", this.experienceController.post);
  }

  public get router(): Router {
    return this._router;
  }
}