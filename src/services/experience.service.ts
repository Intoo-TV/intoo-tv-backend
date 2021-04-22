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
import { getTokenURI, createAccessToEvent, expireTicket } from '../contracts';

export function validateExperience(exp: ExperienceNFT): ValidationResult {
    if (!exp.title) {
        return { isValid: false, message: 'Property title is requried field.' }
    }
    if (!exp.description) {
        return { isValid: false, message: 'Property description is requried field.' }
    }
    if (!exp.start) {
        return { isValid: false, message: 'Start is requried. ' }
    }
    if (!exp.duration) {
        return { isValid: false, message: 'Duration is requried. ' }
    }
    return { isValid: true, message: 'The experience is valid.' }
}

export async function createAccessNFTs(tokenID: string, guestAddress: string) {

}

export async function storeJson(nft: ExperienceNFT): Promise<any> {
    const jsonRandomName = `${uuidv4()}.json`;
    await generateQRCode();
    const url = await pushNFT('./qrCode.png', {
        title: nft.title,
        description: nft.description,
        duration: nft.duration,
        start: nft.start
    }, jsonRandomName);
    return url
}

export async function storeExperience(hostID: string, experience: Experience): Promise<ExperienceModel> {
    experience.hostID = hostID;
    experience.expired = false;
    experience.guestID = undefined;
    const res = await ExperienceSchema.create(experience);
    return res;
}

export async function reserveExperience(guestID: string, experienceID: string): Promise<ValidationResult> {
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

    const originalURI = await getTokenURI(experience.tokenID);
    await createAccessToEvent(experience.tokenID, originalURI, guest.ethAddress);

    await lockBalance(guest, experience.duration);

    experience.guestID = guestID;

    await experience.save();

    return { isValid: true, message: "Assigned guest to the experience." };
}

async function transferLockedTokens(fromID: string, toID: string, amount: number): Promise<ValidationResult> {
    const from = await UserSchema.findById(fromID);
    const to = await UserSchema.findById(toID);

    if (from.lockedBalance < amount) {
        return { isValid: false, message: "The guest doesn't have enough exp tokens!" };
    }

    from.lockedBalance -= amount;
    from.balance -= amount;

    to.balance += amount;

    await from.save();
    await to.save();

    return { isValid: true, message: "Transfer completed." };
}

export async function startExperience(hostID: string, experienceID: string): Promise<ValidationResult> {
    const experience = await ExperienceSchema.findById(experienceID);
    if (experience) {
        if (experience.hostID !== hostID)
            return { isValid: false, message: "Only the host can start the experience." }

        const host = await UserSchema.findById(hostID);
        experience.expired = true;
        await expireTicket(host.ethAddress, experience.tokenID);
        console.log('expired Ticket');
        experience.save();
        console.log('save');

        return { isValid: true, message: "Experience started!" }
    } else {
        return { isValid: false, message: "Invalid experience." }
    }
}

export async function rateExperience(guestID: string, experienceID: string, rate: number): Promise<ValidationResult> {
    const experience = await ExperienceSchema.findById(experienceID);
    if (experience) {
        if (experience.guestID !== guestID)
            return { isValid: false, message: "Only the guest can rate the experience." }
        if (!experience.expired) {
            return { isValid: false, message: "Experience hasn't finished yet." }
        }
        transferLockedTokens(experience.guestID, experience.hostID, experience.duration);
        experience.rate = rate;
        experience.save();
        return { isValid: true, message: "Rate stored!" }
    } else {
        return { isValid: false, message: "Invalid experience." }
    }
}

async function lockBalance(user: UserModel, amount: number): Promise<ValidationResult> {
    if (user.balance - user.lockedBalance < amount) {
        return { isValid: false, message: "The user doesn't have enough credits!" };
    }
    user.lockedBalance += amount;

    await user.save();

    return { isValid: true, message: "Transfer completed." };
}

export async function tip(fromID: string, toID: string, amount: number): Promise<ValidationResult> {
    const from = await UserSchema.findById(fromID);
    const to = await UserSchema.findById(toID);

    if (from.balance < amount) {
        return { isValid: false, message: "The tipper doesn't have enough credits!" };
    }

    from.balance -= amount;
    to.balance += amount;

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

export async function getOpenExperiences(userID: string) {
    const experiences = await ExperienceSchema.find({
        $and: [{ expired: false }, { $and: [{ hostID: { $ne: userID } }, { guestID: undefined }] }]
    }).exec();

    const result = Promise.all(experiences.map(async exp => (
        {
            id: exp.id,
            tokenID: exp.tokenID,
            url: await getTokenURI(exp.tokenID)
        })));

    return result;
}



export async function getUserExperiences(userID: string, past: boolean) {
    const experiences = await ExperienceSchema.find({
        $and: [{ expired: past }, { $or: [{ hostID: userID }, { guestID: userID }] }]
    }).exec();
    const result = Promise.all(experiences.map(async exp => (
        {
            id: exp.id,
            tokenID: exp.tokenID,
            url: await getTokenURI(exp.tokenID)
        })));
    return result;
}