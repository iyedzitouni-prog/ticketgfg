const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ActivityType,
  ChannelType,
  PermissionFlagsBits
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
    activities: [{ name: "Ticket Support", type: ActivityType.Playing }],
    status: "online"
  }
});

/* ================= LOAD SLASH COMMANDS ================= */
client.slashCommands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.slashCommands.set(command.data.name, command);
}
/* ====================================================== */

client.once("ready", () => {
  console.log(colors.green(`[READY] ${client.user.tag}`));
  console.log(colors.yellow(`[COMMANDS] ${client.slashCommands.size} loaded`));
});

/* ================= INTERACTIONS ================= */
client.on("interactionCreate", async interaction => {

  /* ===== SELECT MENU (CREATE TICKET + RESET PANEL) ===== */
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId !== "ticket-panel") return;

    const { guild, user, message } = interaction;
    const type = interaction.values[0];

    // ✅ RESET PANEL VISUALLY
    await interaction.update({
      components: message.components
    });

    // ❌ PREVENT MULTIPLE TICKETS
    const existing = guild.channels.cache.find(
      c => c.name.startsWith("ticket-") && c.name.includes(user.id)
    );

    if (existing) {
      return interaction.followUp({
        content: "❌ لديك تذكرة مفتوحة بالفعل.",
        ephemeral: true
      });
    }

    // ✅ CREATE TICKET
    const channel = await guild.channels.create({
      name: `ticket-${type}-${user.id}`,
      type: ChannelType.GuildText,
      parent: config.ticketCategory,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages
          ]
        },
        {
          id: config.supportRole,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages
          ]
        }
      ]
    });

    await channel.send(
      `🎟️ **تم فتح التذكرة**\n` +
      `👤 المستخدم: ${user}\n` +
      `📌 النوع: **${type.toUpperCase()}**`
    );

    // ✅ LOG
    const logChannel = guild.channels.cache.get(config.logsChannel);
    if (logChannel) {
      logChannel.send(
        `🎟️ Ticket Opened\nUser: ${user.tag}\nType: ${type}\nChannel: ${channel}`
      );
    }

    return interaction.followUp({
      content: `✅ تم إنشاء التذكرة: ${channel}`,
      ephemeral: true
    });
  }

  /* ===== SLASH COMMANDS ===== */
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ حدث خطأ أثناء تنفيذ الأمر.",
        ephemeral: true
      });
    }
  }
});
/* ====================================================== */

/* ================= AUTO CLOSE INACTIVE TICKETS ================= */
const INACTIVE_TIME = 1000 * 60 * 60 * 24; // 24 hours

setInterval(async () => {
  const guild = client.guilds.cache.get(config.guildId);
  if (!guild) return;

  const tickets = guild.channels.cache.filter(c =>
    c.name.startsWith("ticket-")
  );

  for (const channel of tickets.values()) {
    try {
      const messages = await channel.messages.fetch({ limit: 1 });
      const last = messages.first();
      if (!last) continue;

      if (Date.now() - last.createdTimestamp > INACTIVE_TIME) {
        const logChannel = guild.channels.cache.get(config.logsChannel);
        if (logChannel) {
          logChannel.send(`⏱️ Auto-closed: ${channel.name}`);
        }
        await channel.delete();
      }
    } catch {}
  }
}, 1000 * 60 * 10);
/* =============================================================== */

process.on("unhandledRejection", console.error);
client.login(process.env.TOKEN);

