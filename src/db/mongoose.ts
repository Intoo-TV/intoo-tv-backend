import * as mongoose from "mongoose";
import { config } from "dotenv";
import { bucketsPullPathAccessRoles } from "@textile/hub";
import { InterestSchema, PlaceSchema } from "../models";

config();

const { NODE_ENV, DEV_DB } = process.env;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

mongoose
  .connect(DEV_DB, options)
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log("MongoDB connection unsuccessful");
    console.log(err);
  });