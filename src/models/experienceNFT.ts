import { model, Model, Schema, Document } from "mongoose";

export interface Experience { 
    url: string;
    tokenID: number;
    expired: boolean;
    hostID: string;
    guestID: string; 
    start: Date;
    duration: number;
}

export interface ExperienceModel extends Experience, Document { }

const experienceSchema: Schema = new Schema({
    url: {
        type: String,
        required: true,
        unique: true
    },
    tokenID: {
        type: Number,
        required: true,
        unique: true
    },
    expired: {
        type: Boolean,
        required: true,
        default: false
    },
    hostID: {
        type: String,
        required: true
    },
    guestID: {
        type: String,
        required: false,
        default: undefined
    },
    start: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    
});

export const ExperienceSchema: Model<ExperienceModel> = model<ExperienceModel>("experiences", experienceSchema);
