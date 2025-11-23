# Meowbot
Successor to [Selfcord](https://github.com/scaratech/selfcord)

## Setup
### Discord
1. Go to the [Discord developer portal](https://discord.com/developers/applications)
2. Create a new application
3. Copy the "Application ID"
4. Go to the "Installation" section and make sure only "User Install" is selected
    - Make sure it has the `applications.commands` scope
5. Go to the "Bot" tab and reset/copy its token
6. Go to the "OAuth2" tab, under "Scopes" select `applications.commands`. Integration type should be "User Install". Then, copy the "Generated URL" and paste it into Discord or your browser and add the app

### Code
Requirements: NodeJS, Git, PNPM
```sh
$ git clone https://github.com/scaratech/meowbot
$ cd meowbot
$ pnpm i
$ pnpm build
```
`.env` file:
```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
OWNER=your_discord_user_id_here
```
```sh
$ pnpm deploy
$ pnpm start