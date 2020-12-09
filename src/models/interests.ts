import { model, Model, Schema, Document } from "mongoose";

export interface Place { 
    placeName: string;
}

export interface PlaceModel extends Place, Document { }

const placeSchema: Schema = new Schema({
    placeName: {
        type: String,
        required: true,
        unique: true
    },
});

export const PlaceSchema: Model<PlaceModel> = model<PlaceModel>("places", placeSchema);
