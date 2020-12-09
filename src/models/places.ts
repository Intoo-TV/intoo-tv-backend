import { model, Model, Schema, Document } from "mongoose";

export interface Interest { 
    interest: string;
}

export interface InterestModel extends Interest, Document { }

const interestsSchema: Schema = new Schema({
    interest: {
        type: String,
        required: true
    },
});

export const InterestSchema: Model<InterestModel> = model<InterestModel>("interests", interestsSchema);
