import { ping, message } from './commands/index.js';
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
    ping.data.toJSON(),
    message.data.toJSON(),
];

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error('Missing DISCORD_TOKEN and/or CLIENT_ID in .env');
    process.exit(1);
}

const rest = new REST().setToken(token);

async function deployer() {
    try {
        console.log(`Refreshing ${commands.length} commands`);

        const data: any = await rest.put(
            Routes.applicationCommands(clientId as string),
            { body: commands }
        );

        console.log(`Reloaded ${data.length} commands`);
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

deployer();
