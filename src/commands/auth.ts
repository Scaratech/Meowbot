import type { Command } from '../utils/types.js';
import {
    add,
    remove,
    getAll,
    setStatus,
    isEnabled
} from '../utils/auth.js';
import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    InteractionContextType,
    PermissionFlagsBits
} from 'discord.js';

export const auth: Command = {
    data: new SlashCommandBuilder()
        .setName('auth')
        .setDescription('Manage user authorization')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a user to the authorized list')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to authorize')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a user from the authorized list')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to deauthorize')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all authorized users')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Toggle authorization on or off')
                .addStringOption(option =>
                    option
                        .setName('state')
                        .setDescription('Enable or disable authorization')
                        .setRequired(true)
                        .addChoices(
                            { name: 'on', value: 'on' },
                            { name: 'off', value: 'off' }
                        )
                )
        )
        .setContexts([
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
            InteractionContextType.Guild
        ])
        .setIntegrationTypes([1])
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'add': {
                    const user = interaction.options.getUser('user', true);
                    const added = add(user.id);

                    if (added) {
                        await interaction.editReply(`Added ${user.tag} (${user.id}) to authorized users`);
                        console.log(`${interaction.user.tag} added ${user.tag} to authorized users`);
                    } else {
                        await interaction.editReply(`${user.tag} is already authorized`);
                    }

                    break;
                }

                case 'remove': {
                    const user = interaction.options.getUser('user', true);
                    const removed = remove(user.id);

                    if (removed) {
                        await interaction.editReply(`Removed ${user.tag} (${user.id}) from authorized users`);
                        console.log(`${interaction.user.tag} removed ${user.tag} from authorized users`);
                    } else {
                        await interaction.editReply(`${user.tag} is not in the authorized users list`);
                    }

                    break;
                }

                case 'list': {
                    const authorized = getAll();

                    if (authorized.length === 0) {
                        await interaction.editReply('No authorized users');
                        break;
                    }

                    const details = await Promise.all(
                        authorized.map(async (userId) => {
                            try {
                                const user = await interaction.client.users.fetch(userId);
                                return `• ${user.tag} (${userId})`;
                            } catch {
                                return `• Unknown User (${userId})`;
                            }
                        })
                    );

                    const status = isEnabled() ? 'Enabled' : 'Disabled';
                    const message = `**Authorization Status:** ${status}\n\n**Authorized Users:**\n${details.join('\n')}`;

                    await interaction.editReply(message);
                    break;
                }

                case 'status': {
                    const state = interaction.options.getString('state', true);
                    const enabled = state === 'on';

                    setStatus(enabled);
                    
                    const status = enabled ? 'enabled' : 'disabled';
                    await interaction.editReply(`Authorization ${status}`);
                    console.log(`${interaction.user.tag} set authorization to ${state}`);
                    break;
                }

                default:
                    await interaction.editReply('Unknown subcommand');
            }
        } catch (err) {
            console.error(`Error executing auth command: ${err}`);
            await interaction.editReply('An error occurred while executing the command');
        }
    },
};
