import { model, Model, Schema, Document } from "mongoose";

export interface Experience { 
    tokenID: number;
    expired: boolean;
    hostID: string;
    guestID: string; 
    start: Date;
    duration: number;
    rate?: number;
    streamUrl?: string;
    streamKey?: string;
}

export interface ExperienceModel extends Experience, Document { }

const experienceSchema: Schema = new Schema({
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
    rate: {
        type: Number,
        required: false,
        default: undefined
    },
    streamUrl: {
        type: String,
        required: false,
        default: undefined
    },
    streamKey: {
        type: String,
        required: false,
        default: undefined
    },
    
});

export const ExperienceSchema: Model<ExperienceModel> = model<ExperienceModel>("experiences", experienceSchema);
