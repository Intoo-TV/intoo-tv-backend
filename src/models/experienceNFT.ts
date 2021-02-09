import { model, Model, Schema, Document } from "mongoose";

export interface Experience { 
    url: string;
    tokenID: string;
    expired: boolean;
}

export interface ExperienceModel extends Experience, Document { }

const experienceSchema: Schema = new Schema({
    url: {
        type: String,
        required: true,
        unique: true
    },
    tokenID: {
        type: String,
        required: true,
        unique: true
    },
    expired: {
        type: Boolean,
        required: true,
        default: false
    },
    
});

export const ExperienceSchema: Model<ExperienceModel> = model<ExperienceModel>("experiences", experienceSchema);
