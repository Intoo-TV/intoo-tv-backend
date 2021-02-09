import * as qr from 'qr-image';
import { pushNFT } from '../textile.config'
import { v4 as uuidv4 } from 'uuid';
import {
    ExperienceSchema,
    ValidationResult,
    ExperienceNFT
} from '../models';



export function validateExperience(experience: any): ValidationResult {
    if (!experience.title) {
        return { isValid: false, message: 'Title is requried. ' }
    }
    if (!experience.properties) {
        return { isValid: false, message: 'Properties are requried field.' }
    }
    if (!experience.properties.name) {
        return { isValid: false, message: 'Property name is requried field.' }
    }
    if (!experience.properties.description) {
        return { isValid: false, message: 'Property description is requried field.' }
    }
    return { isValid: true, message: 'The experience is valid.' }
}


export function validateTokenID(experience: any): ValidationResult {
    if (!experience.tokenID) {
        return { isValid: false, message: 'tokenID is required' }
    }
    if (!experience.url) {
        return { isValid: false, message: 'Url is requried. ' }
    }
    return { isValid: true, message: 'The experience is valid.' }
}


export async function storeNFT(tokenID: string, nft: ExperienceNFT) {
    const jsonRandomName = `${uuidv4()}.json`;
    await generateQRCode();
    const url = await pushNFT('./qrCode.png', nft, jsonRandomName);
    return { url };
}

export async function storeTokenIDNFTUrl(tokenID: string, url: string): Promise<void> {
    await ExperienceSchema.create({
        tokenID,
        url,
        expired: false
    })
}

function generateRandomSequence(): string {
    return `${uuidv4()}-${uuidv4()}-${uuidv4()}`
}

export async function generateQRCode() {
    var qr_svg = qr.image(generateRandomSequence(), { type: 'png' });
    qr_svg.pipe(require('fs').createWriteStream('qrCode.png'));
}