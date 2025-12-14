const { SlashCommandBuilder } = require("discord.js");
const config = require("../settings/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add a user to this ticket")
    .addUserOption(opt =>
      opt.setName("user").setDescription("User to add").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const channel = interaction.channel;
      const user = interaction.options.getUser("user");

      if (!channel.name.startsWith("ticket-"))
        return interaction.editReply("❌ Not a ticket channel.");

      if (!interaction.member.roles.cache.has(config.supportRole))
        return interaction.editReply("❌ Only support can add users.");

      await channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true
      });

      await interaction.editReply(`✅ Added ${user} to the ticket.`);

    } catch (err) {
      console.error("ADD ERROR:", err);
      await interaction.editReply("❌ Failed to add user.");
    }
  }
};
