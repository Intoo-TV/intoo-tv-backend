import * as qr from 'qr-image';
import { pushNFT } from '../textile.config'
import { v4 as uuidv4 } from 'uuid';



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


export async function storeNFT(nft: ExperienceNFT) {
    const jsonRandomName = `${uuidv4()}.json`;

    await generateQRCode();
    await pushNFT('./qrCode.png', nft, jsonRandomName);

    return { url: `https://hub.textile.io/thread/bafkwfcy3l745x57c7vy3z2ss6ndokatjllz5iftciq4kpr4ez2pqg3i/buckets/bafzbeiaorr5jomvdpeqnqwfbmn72kdu7vgigxvseenjgwshoij22vopice/${jsonRandomName}` };

}

function generateRandomSequence(): string {
    return `${uuidv4()}-${uuidv4()}-${uuidv4()}`
}

export async function generateQRCode() {
    var qr_svg = qr.image(generateRandomSequence(), { type: 'png' });
    qr_svg.pipe(require('fs').createWriteStream('qrCode.png'));
}
export interface ValidationResult {
    isValid: boolean;
    message: string;
}
export interface ExperienceNFT {
    title: string;
    properties: NFTProperties;
}

export interface NFTProperties {
    name: string;
    description: string;
    image: string;
}