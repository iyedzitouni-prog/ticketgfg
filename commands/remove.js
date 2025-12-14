const { SlashCommandBuilder } = require("discord.js");
const config = require("../settings/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a user from this ticket")
    .addUserOption(opt =>
      opt.setName("user").setDescription("User to remove").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel;
    const user = interaction.options.getUser("user");

    if (!channel.name.startsWith("ticket-"))
      return interaction.editReply("❌ Not a ticket channel.");

    if (!interaction.member.roles.cache.has(config.supportRole))
      return interaction.editReply("❌ Only support can remove users.");

    await channel.permissionOverwrites.delete(user.id);
    await interaction.editReply(`❌ Removed ${user} from the ticket.`);
  }
};
