const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Send the ticket panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor("#0b1c2d")
      .setTitle(" Ticket")
      .setDescription("**مرحبا بكم في دعم نرجوا طرح استفساركم**")
      .setImage("https://cdn.discordapp.com/attachments/1449552351663882473/1449593114024218737/Edit_Type_Layer.jpg?ex=693f764a&is=693e24ca&hm=0c293c13adcff6dcc62dd939f3ee5665dbce7c41aacb965894add49994f54d29&")
      .setFooter({ text: "Dexoz Community" });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket-panel")
      .setPlaceholder("اضغط لفتح تذكرة")
      .addOptions([
        { label: "📩 دعم فني", value: "support" },
        { label: "🎮 إنشاء كلان", value: "clan" },
        { label: "⚠️ شكوى", value: "complaint" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    // ✅ SEND PANEL AS THE INTERACTION RESPONSE (ONLY ONCE)
    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
