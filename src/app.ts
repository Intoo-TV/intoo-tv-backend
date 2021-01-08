import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import { injectable } from "inversify";
import {
  UserRouter,
  ExperienceRouter,
  GeneralDataRouter,
  SwaggerRouter,
} from "./routers";
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
var cors = require('cors');
import './db/mongoose'
import { UserSchema } from "./models";
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
require('dotenv').config()

@injectable()
export class App {
  private _app: express.Application;

  constructor(
    private swaggerRouter: SwaggerRouter,
    private experienceRouter: ExperienceRouter,
    private userRouter: UserRouter,
    private generalDataRouter: GeneralDataRouter
  ) {
    this._app = express();
    this.config();
  }

  public get app(): express.Application {
    return this._app;
  }

  private config(): void {
    // const metricsMiddleware = promBundle({
    //   includeMethod: true,
    //   includePath: true
    // });


    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
      function (email, password, cb) {
        return UserSchema.findOne({ email, password })
          .then(user => {
            if (!user) {
              return cb(null, false, { message: 'Incorrect email or password.' });
            }
            return cb(null, user, { message: 'Logged In Successfully' });
          })
          .catch(err => cb(err));
      }
    ));

    var opts: any = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = 'secret';
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
      UserSchema.findById(jwt_payload._id, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      });

    }));


    // this._app.use(metricsMiddleware);

    // support application/json
    this._app.use(bodyParser.json());
    // helmet security
    this._app.use(helmet());
    //support application/x-www-form-urlencoded post data
    this._app.use(bodyParser.urlencoded({ extended: false }));

    this._app.use(cookieParser());

    this._app.use(cors());
    //Initialize app routes
    this._initRoutes();

  }

  private _initRoutes() {
    this._app.use("/api/docs", this.swaggerRouter.router);
    this._app.use("/api/experience", this.experienceRouter.router);
    this._app.use("/api/user", this.userRouter.router);
    this._app.use("/api", this.generalDataRouter.router);
  }
}