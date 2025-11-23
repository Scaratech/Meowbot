import type { Command } from './utils/types.js';
import { 
    ping,
    message,
    auth
} from './commands/index.js';
import { isAuthorized } from './utils/auth.js';
import {
    Client,
    GatewayIntentBits,
    Collection,
    Events,
    Interaction,
    Message,
    Partials
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();
console.clear();

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection<string, Command>();
client.commands.set(ping.data.name, ping);
client.commands.set(message.data.name, message);
client.commands.set(auth.data.name, auth);

client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Command ${interaction.commandName} not found`);
        return;
    }

    const user = interaction.user;
    
    if (interaction.commandName === 'auth') {
        const ownerId = process.env.OWNER;
        
        if (!ownerId) {
            console.error('OWNER not set in .env');

            await interaction.reply({
                content: 'Owner not configured',
                ephemeral: true
            });

            return;
        }
        
        if (user.id !== ownerId) {
            console.log(`${user.tag} (${user.id}) attempted to use /auth but is not the owner`);

            await interaction.reply({
                content: 'You are not authorized to use this command',
                ephemeral: true
            });

            return;
        }
    } else if (!isAuthorized(user.id)) {
        console.log(`${user.tag} (${user.id}) attempted to execute ${interaction.commandName} but is not authorized`);

        await interaction.reply({
            content: 'You are not authorized to use this command',
            ephemeral: true
        });

        return;
    }

    console.log(`${user.tag} (${user.id}) executed ${interaction.commandName}`);

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(`Error executing command ${interaction.commandName}: ${err}`);

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

client.on(Events.MessageCreate, (message: Message) => {
    if (message.author.bot) return;

    const user = message.author;
    const content = message.content || '[No text content]';

    console.log(`${user.tag} (${user.id}) sent a message: ${content}`);
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('DISCORD_TOKEN not found in .env');
    process.exit(1);
}

client.login(token);
