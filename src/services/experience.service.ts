import * as qr from 'qr-image';
import { pushNFT } from '../textile.config'
import { v4 as uuidv4 } from 'uuid';
import {
    ExperienceSchema,
    ValidationResult,
    ExperienceNFT,
    Experience,
    ExperienceModel,
    UserSchema,
    UserModel
} from '../models';
import { Users } from '@textile/hub';



export function validateNFTProps(nft: ExperienceNFT): ValidationResult {
    if (!nft.title) {
        return { isValid: false, message: 'Title is requried. ' }
    }
    if (!nft.properties) {
        return { isValid: false, message: 'Properties are requried field.' }
    }
    if (!nft.properties.name) {
        return { isValid: false, message: 'Property name is requried field.' }
    }
    if (!nft.properties.description) {
        return { isValid: false, message: 'Property description is requried field.' }
    }
    return { isValid: true, message: 'The experience is valid.' }
}


export function validateExperience(experience: Experience): ValidationResult {
    if (!experience.url) {
        return { isValid: false, message: 'URL is required' }
    } if (!experience.tokenID) {
        return { isValid: false, message: 'TokenID is required' }
    }
    if (!experience.start) {
        return { isValid: false, message: 'Start is requried. ' }
    }
    if (!experience.duration) {
        return { isValid: false, message: 'End is requried. ' }
    }
    return { isValid: true, message: 'The experience is valid.' }
}


export async function storeNFT(nft: ExperienceNFT): Promise<any> {
    const jsonRandomName = `${uuidv4()}.json`;
    await generateQRCode();
    const url = await pushNFT('./qrCode.png', nft, jsonRandomName);
    return { url };
}

export async function storeExperience(hostID: string, experience: Experience): Promise<ExperienceModel> {
    experience.hostID = hostID;
    experience.expired = false;
    experience.guestID = undefined;
    const res = await ExperienceSchema.create(experience);
    return res;
}

export async function buyExperience(guestID: string, experienceID: string): Promise<ValidationResult> {
    const experience = await ExperienceSchema.findById(experienceID);
    if (!experience) {
        return { isValid: false, message: "Invalid experience!" };
    }
    const guest = await UserSchema.findById(guestID);
    if (!guest) {
        return { isValid: false, message: "Invalid user!" };
    }
    if (experience.guestID) {
        return { isValid: false, message: "This experience has one guest already." };
    }
      
    if (guest.balance < experience.duration) {
        return { isValid: false, message: "The guest doesn't have enough exp tokens!" };
    }

    const hostID = experience.hostID;
    const host = await UserSchema.findById(hostID);
    
    await transferTokens(guest, host, experience.duration);

    experience.guestID = guestID;
    await experience.save();

    return { isValid: true, message: "Assigned guest to the experience." };
}

async function transferTokens(from: UserModel, to: UserModel, amount: number): Promise<ValidationResult> {
    if (from.balance < amount) {
        return { isValid: false, message: "The guest doesn't have enough exp tokens!" };
    }

    from.balance = from.balance - amount;
    to.balance = to.balance - amount;

    await from.save();
    await to.save();

    return { isValid: true, message: "Transfer completed." };
}

function generateRandomSequence(): string {
    return `${uuidv4()}-${uuidv4()}-${uuidv4()}`
}

export async function generateQRCode() {
    var qr_svg = qr.image(generateRandomSequence(), { type: 'png' });
    qr_svg.pipe(require('fs').createWriteStream('qrCode.png'));
}