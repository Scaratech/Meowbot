import type { Command } from './types.js';
import { ping } from './commands/index.js';
import readline from 'node:readline';
import {
    Client,
    GatewayIntentBits,
    Collection,
    Events,
    Interaction
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();
console.clear();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
    ],
});

client.commands = new Collection<string, Command>();
client.commands.set(ping.data.name, ping);

client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`);
    console.log('message <user_id> <message>');
    meow();
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error('Error executing command:', err);

        const reply = { 
            content: 'There was an error executing this command', 
            ephemeral: true 
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply);
        } else {
            await interaction.reply(reply);
        }
    }
});

function meow() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> ',
    });

    rl.prompt();

    rl.on('line', async (line) => {
        const input = line.trim();

        if (!input) {
            rl.prompt();
            return;
        }

        const regex = input.match(/^message\s+(\S+)\s+(.+)$/);

        if (regex) {
            const [, uid, message] = regex;

            await sendMessage(uid, message);
            rl.prompt();

            return;
        }

        console.log('Unknown command');
        rl.prompt();
    });
}
async function sendMessage(uid: string, message: string) {
    try {
        const user = await client.users.fetch(uid);

        await user.send(message);
        console.log(`Message sent to ${user.tag} (${uid})`);
    } catch (err) {
        // :sob:
        if (err instanceof Error) {
            if (err.message.includes('Cannot send messages to this user')) {
                console.error(`Cannot send message to user ${uid}`);
            } else if (err.message.includes('Unknown User')) {
                console.error(`User ${uid} not found`);
            } else {
                console.error(`Error sending message: ${err.message}`);
            }
        } else {
            console.error('Unknown error occurred');
        }
    }
}

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('DISCORD_TOKEN not found in .env');
    process.exit(1);
}

client.login(token);
