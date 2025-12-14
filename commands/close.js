const { SlashCommandBuilder } = require("discord.js");
const config = require("../settings/config");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Close this ticket"),

  async execute(interaction) {
    const channel = interaction.channel;

    if (!channel.name.startsWith("ticket-")) {
      return interaction.reply({
        content: "❌ This is not a ticket channel.",
        ephemeral: true
      });
    }

    const messages = await channel.messages.fetch({ limit: 100 });
    const transcript = messages
      .reverse()
      .map(m => `[${m.author.tag}] ${m.content || "(no text)"}`)
      .join("\n");

    const fileName = `transcript-${channel.id}.txt`;
    fs.writeFileSync(fileName, transcript);

    const logChannel = interaction.guild.channels.cache.get(config.logsChannel);
    if (logChannel) {
      await logChannel.send({
        content: `🔒 **Ticket Closed**\nChannel: ${channel.name}\nClosed by: ${interaction.user.tag}`,
        files: [fileName]
      });
    }

    fs.unlinkSync(fileName);

    await interaction.reply("🔒 Closing ticket in 5 seconds...");
    setTimeout(() => channel.delete().catch(() => {}), 5000);
  }
};
