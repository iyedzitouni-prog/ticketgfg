const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ActivityType
} = require("discord.js");

const fs = require("fs");
const colors = require("colors");
const config = require("./settings/config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
  presence: {
    activities: [{
      name: "Choose your status",
      type: ActivityType.Streaming,
      url: "https://www.twitch.tv/zqx"
    }],
    status: "online"
  }
});

/* ================== LOAD SLASH COMMANDS ================== */
client.slashCommands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.slashCommands.set(command.data.name, command);
}
/* ========================================================= */

/* ================== BOT READY ================== */
client.once("ready", () => {
  console.log(colors.green(`[INFO] ${client.user.tag} is online!`));
});
/* ========================================================= */

/* ================== INTERACTION HANDLER ================== */
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Error executing command",
        ephemeral: true
      });
    }
  }
});
/* ========================================================= */

process.on("unhandledRejection", error => {
  console.log(`[ERROR] ${error}`.red);
});

client.login(config.token);
