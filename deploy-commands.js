const { REST, Routes } = require("discord.js");
const fs = require("fs");
const config = require("./settings/config");

const commands = [];
const commandFiles = fs.readdirSync("./commands");

for (const file of commandFiles) {
  if (!file.endsWith(".js")) continue;
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        config.clientId,
        config.guildId
      ),
      { body: commands }
    );

    console.log("✅ Slash commands registered");
  } catch (error) {
    console.error(error);
  }
})();
