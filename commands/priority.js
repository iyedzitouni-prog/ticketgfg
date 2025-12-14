const { SlashCommandBuilder } = require("discord.js");
const config = require("../settings/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("priority")
    .setDescription("Set ticket priority")
    .addStringOption(opt =>
      opt.setName("level")
        .setDescription("Priority level")
        .setRequired(true)
        .addChoices(
          { name: "Low", value: "LOW" },
          { name: "Medium", value: "MEDIUM" },
          { name: "High", value: "HIGH" }
        )
    ),

  async execute(interaction) {
    const channel = interaction.channel;

    if (!channel.name.startsWith("ticket-"))
      return interaction.reply({ content: "❌ Not a ticket channel.", ephemeral: true });

    if (!interaction.member.roles.cache.has(config.supportRole))
      return interaction.reply({ content: "❌ Only support can set priority.", ephemeral: true });

    // ✅ ACK FIRST
    await interaction.reply({ content: "🚨 Setting priority...", ephemeral: true });

    await channel.setTopic(`Priority: ${interaction.options.getString("level")}`);

    await interaction.editReply(
      `✅ Priority set to **${interaction.options.getString("level")}**`
    );
  }
};
