import type { Command } from './utils/types.js';
import { 
    ping,
    message
} from './commands/index.js';
import {
    Client,
    GatewayIntentBits,
    Collection,
    Events,
    Interaction,
    Message
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();
console.clear();

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.commands = new Collection<string, Command>();
client.commands.set(ping.data.name, ping);
client.commands.set(message.data.name, message);

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
