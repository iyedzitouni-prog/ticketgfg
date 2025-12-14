const { REST, Routes } = require("discord.js");
const fs = require("fs");
const config = require("./settings/config");

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        config.clientId, // APPLICATION ID
        config.guildId  // SERVER ID
      ),
      { body: commands }
    );

    console.log("✅ Slash commands registered");
  } catch (error) {
    console.error(error);
  }
})();
