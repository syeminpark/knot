// models/character.js

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const characterSchema = new mongoose.Schema(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,

        },
        userUUID: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        personaAttributes: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        },
        connectedCharacters: [
            {
                type: mongoose.Schema.Types.Mixed,
                required: false,
            },
        ],
        imageSrc: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        },
        order: {
            type: Number,  // New field for tracking character's position
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
        collection: 'characters',
    }
);

// Static Methods

characterSchema.statics.createCharacter = async function (
    userUUID, // Add userUUID to associate the character with a user
    uuid,
    name,
    personaAttributes,
    connectedCharacters,
    imageSrc,
    order
) {
    try {
        const character = await this.create({
            userUUID, // Save userUUID in the character document
            uuid,
            name,
            personaAttributes,
            connectedCharacters,
            imageSrc,
            order
        });
        return character;
    } catch (error) {
        throw error;
    }
};

characterSchema.statics.updateCharacter = async function (uuid, update) {
    try {
        const character = await this.findOneAndUpdate({ uuid }, update, {
            new: true,
            upsert: true,
        });
        return character;
    } catch (error) {
        throw error;
    }
};

characterSchema.statics.getCharacterByUUID = async function (uuid) {
    try {
        const character = await this.findOne({ uuid });
        return character;
    } catch (error) {
        throw error;
    }
};

// Get all characters for a specific user
characterSchema.statics.getAllCharactersByUserUUID = async function (userUUID) {
    try {
        // Fetch characters for the user and sort them by their order field
        const characters = await this.find({ userUUID }).sort({ order: 1 });
        return characters;
    } catch (error) {
        throw error;
    }
};

characterSchema.statics.deleteCharacterByUUID = async function (uuid) {
    try {
        const character = await this.findOneAndDelete({ uuid });
        return character;
    } catch (error) {
        throw error;
    }
};

// Delete all characters for a specific user
characterSchema.statics.deleteAllCharactersByUserUUID = async function (userUUID) {
    try {
        await this.deleteMany({ userUUID });
    } catch (error) {
        throw error;
    }
};

characterSchema.statics.reorderCharacters = async function (characters) {
    const bulkOperations = characters.map((uuid, index) => {
        console.log(uuid, index)
        return {
            updateOne: {
                filter: { uuid, uuid, },
                update: { order: index },
            },
        };
    });

    try {
        // Perform bulk update to save the new order in the database
        await this.bulkWrite(bulkOperations);
    } catch (error) {
        throw error;
    }
};

export default mongoose.model('Character', characterSchema);
