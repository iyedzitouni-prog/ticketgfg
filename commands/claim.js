const {
  SlashCommandBuilder
} = require("discord.js");

const config = require("../settings/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription("Claim this ticket"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel;
    const member = interaction.member;

    // Must be ticket channel
    if (!channel.name.startsWith("ticket-")) {
      return interaction.editReply("❌ This is not a ticket channel.");
    }

    // Must have support role
    if (!member.roles.cache.has(config.supportRole)) {
      return interaction.editReply("❌ You must be support staff to claim tickets.");
    }

    // Already claimed?
    if (channel.name.includes("-claimed")) {
      return interaction.editReply("❌ This ticket is already claimed.");
    }

    try {
      // Rename channel
      await channel.setName(`${channel.name}-claimed`);

      // Set topic (optional)
      await channel.setTopic(`Claimed by ${interaction.user.tag}`);

      await interaction.editReply(`🧑‍💼 Ticket claimed by ${interaction.user}`);

      // Log claim
      const logChannel = interaction.guild.channels.cache.get(config.logsChannel);
      if (logChannel) {
        logChannel.send(
          `🧑‍💼 **Ticket Claimed**\n` +
          `Staff: ${interaction.user.tag}\n` +
          `Channel: ${channel}`
        );
      }

    } catch (error) {
      console.error("CLAIM ERROR:", error);
      return interaction.editReply("❌ Failed to claim this ticket.");
    }
  }
};
