import type { Command } from '../utils/types.js';
import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    InteractionContextType,
    PermissionFlagsBits
} from 'discord.js';

export const message: Command = {
    data: new SlashCommandBuilder()
        .setName('message')
        .setDescription('Send a DM to a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to send message to')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Message to send')
                .setRequired(true)
        )
        .setContexts([
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel
        ])
        .setIntegrationTypes([1])
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user', true);
        const content = interaction.options.getString('message', true);

        try {
            await user.send(content);

            await interaction.editReply(`Message sent to ${user.tag} (${user.id})`);
            console.log(`Message sent to ${user.tag} (${user.id}): ${content}`);
        } catch (err) {
            // hell
            if (err instanceof Error) {
                if (err.message.includes('Cannot send messages to this user')) {
                    const msg = `Cannot send message to ${user.tag}`;
                    await interaction.editReply(msg);
                    console.error(msg);
                } else {
                    const msg = `Error: ${err.message}`;
                    await interaction.editReply(msg);
                    console.error(msg);
                }
            } else {
                const msg = 'Unknown error occurred';
                await interaction.editReply(msg);
                console.error(msg);
            }
        }
    },
};
