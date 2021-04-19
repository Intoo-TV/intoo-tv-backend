export interface ExperienceNFT {
    title: string;
    description: string;
    image: string;
    start: Date;
    duration: number;
}

export interface CreateExperience {
    nft: ExperienceNFT;
    templateId: number;
    saveAsTemplate: boolean;
}