const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`🚀 تم تشغيل البوت بنجاح: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith('+')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const sendError = (text) => message.reply(`❌ **خطأ:** ${text}`).catch(() => {});

  if (command === 'قفل') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return sendError('ليست لديك صلاحية لإدارة القنوات!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
      await message.reply('🔒 **تم قفل الروم بنجاح.**');
    } catch (e) {
      sendError('حدث خطأ، تأكد أن رتبة البوت أعلى.');
    }
  }

  if (command === 'فتح') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return sendError('ليست لديك صلاحية لإدارة القنوات!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
      await message.reply('🔓 **تم فتح الروم بنجاح.**');
    } catch (e) {
      sendError('حدث خطأ في تعديل الصلاحيات.');
    }
  }

  if (command === 'اخفاء') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return sendError('ليست لديك صلاحية!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false });
      await message.reply('🙈 **تم إخفاء الروم عن الجميع.**');
    } catch (e) {
      sendError('فشل إخفاء الروم.');
    }
  }

  if (command === 'اظهار') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return sendError('ليست لديك صلاحية!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: true });
      await message.reply('🐵 **تم إظهار الروم للجميع.**');
    } catch (e) {
      sendError('فشل إظهار الروم.');
    }
  }

  if (command === 'رول') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return sendError('ليست لديك صلاحية لإدارة الرولات!');
    const targetMember = message.mentions.members.first();
    const roleArg = args.slice(1).join(' ').replace(/[<@&>]/g, '');
    const role = message.guild.roles.cache.get(roleArg) || message.guild.roles.cache.find(r => r.name.toLowerCase().includes(roleArg.toLowerCase()));

    if (!targetMember || !role) return sendError('اكتب: `+رول @العضو اسم_الرول`');
    if (message.guild.members.me.roles.highest.position <= role.position) return sendError('رتبة البوت أقل من هذه الرتبة!');

    try {
      await targetMember.roles.add(role);
      await message.reply(`✅ تم إعطاء رول **${role.name}** للعضو ${targetMember}.`);
    } catch (e) {
      sendError('حدث خطأ أثناء إعطاء الرتبة.');
    }
  }

  if (command === 'شيل') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return sendError('ليست لديك صلاحية لإدارة الرولات!');
    const targetMember = message.mentions.members.first();
    const roleArg = args.slice(1).join(' ').replace(/[<@&>]/g, '');
    const role = message.guild.roles.cache.get(roleArg) || message.guild.roles.cache.find(r => r.name.toLowerCase().includes(roleArg.toLowerCase()));

    if (!targetMember || !role) return sendError('اكتب: `+شيل @العضو اسم_الرول`');
    if (message.guild.members.me.roles.highest.position <= role.position) return sendError('رتبة البوت أقل من هذه الرتبة!');

    try {
      await targetMember.roles.remove(role);
      await message.reply(`🗑️ تم إزالة رول **${role.name}** من العضو ${targetMember}.`);
    } catch (e) {
      sendError('حدث خطأ أثناء سحب الرتبة.');
    }
  }

  if (command === 'تف') {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return sendError('ليس لديك صلاحية حظر الأعضاء!');
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]?.replace(/[<@!>]/g, ''));
    if (!target) return sendError('اكتب: `+تف @العضو [السبب]`');
    if (!target.bannable || target.roles.highest.position >= message.member.roles.highest.position) return sendError('لا يمكنني حظر هذا العضو!');

    const reason = args.slice(1).join(' ') || 'بدون سبب';
    try {
      await target.ban({ reason });
      await message.reply(`🔨 **تم حظر العضو ${target.user.tag}.**`);
    } catch (e) {
      sendError('حدث خطأ أثناء الحظر.');
    }
  }

  if (command === 'برا') {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return sendError('ليس لديك صلاحية طرد الأعضاء!');
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]?.replace(/[<@!>]/g, ''));
    if (!target) return sendError('اكتب: `+برا @العضو [السبب]`');
    if (!target.kickable || target.roles.highest.position >= message.member.roles.highest.position) return sendError('لا يمكنني طرد هذا العضو!');

    const reason = args.slice(1).join(' ') || 'بدون سبب';
    try {
      await target.kick(reason);
      await message.reply(`👢 **تم طرد العضو ${target.user.tag}.**`);
    } catch (e) {
      sendError('حدث خطأ أثناء الطرد.');
    }
  }

  if (command === 'مسح' || command === 'كلير') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return sendError('ليس لديك صلاحية إدارة الرسائل!');
    const count = parseInt(args[0]);
    if (isNaN(count) || count <= 0 || count > 100) return sendError('اكتب عدد بين 1 و 100: `+مسح 50`');

    try {
      await message.channel.bulkDelete(count + 1, true);
      const tempMsg = await message.channel.send(`🧹 تم مسح \`${count}\` رسالة.`);
      setTimeout(() => tempMsg.delete().catch(() => {}), 3000);
    } catch (e) {
      sendError('لا يمكنني مسح الرسائل الأقدم من 14 يوماً.');
    }
  }

  if (command === 'جيفواي') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return sendError('أمر الجيفواي مخصص للأدميرال فقط!');
    
    const timeMinutes = parseInt(args[0]);
    const prize = args.slice(1).join(' ');
    await message.delete().catch(() => {});

    if (isNaN(timeMinutes) || timeMinutes <= 0 || !prize) {
      return message.channel.send('❌ اكتب هكذا: `+جيفواي 5 1000 روبكس`');
    }

    const embed = new EmbedBuilder()
      .setTitle('🎉 مسابقة جيفواي جديدة')
      .setDescription(`🎁 الجائزة: **${prize}**\n⏱️ الوقت: **${timeMinutes} دقائق**\n\nاضغط الزر للمشاركة!`)
      .setColor(0xF1C40F);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('join_gw').setLabel('🎉 اشترك').setStyle(ButtonStyle.Success)
    );

    const giveawayMsg = await message.channel.send({ embeds: [embed], components: [row] });
    const entrants = new Set();

    const collector = giveawayMsg.createMessageComponentCollector({ time: timeMinutes * 60 * 1000 });
    
    collector.on('collect', async i => {
      if (entrants.has(i.user.id)) return i.reply({ content: '⚠️ أنت مشارك مسبقاً!', ephemeral: true });
      entrants.add(i.user.id);
      await i.reply({ content: '✅ تم تسجيل اسمك بالسحب!', ephemeral: true });
    });

    collector.on('end', async () => {
      if (entrants.size === 0) {
        return giveawayMsg.edit({ embeds: [embed.setDescription(`🎁 الجائزة: **${prize}**\n❌ **انتهت المسابقة ولم يشارك أحد!**`).setColor(0xE74C3C)], components: [] }).catch(() => {});
      }

      const entrantsArray = Array.from(entrants);
      const winnerId = entrantsArray[Math.floor(Math.random() * entrantsArray.length)];
      const winner = await message.guild.members.fetch(winnerId).catch(() => null);

      const endEmbed = new EmbedBuilder()
        .setTitle('🎊 انتهت المسابقة وتحدد الفائز!')
        .setDescription(`🎁 الجائزة: **${prize}**\n👑 الفائز: ${winner ? winner : '<@' + winnerId + '>'}`)
        .setColor(0x2ECC71);

      await giveawayMsg.edit({ embeds: [endEmbed], components: [] }).catch(() => {});
      await message.channel.send(`🎉 مبروك لـ ${winner ? winner : '<@' + winnerId + '>'} فزت بـ **${prize}**!`).catch(() => {});
    });
  }

  if (command === 'بينج') {
    const msg = await message.reply('🏓 جاري القياس...');
    const ping = msg.createdTimestamp - message.createdTimestamp;
    await msg.edit(`🏓 **البينج:** \`${ping}ms\` ⚡`);
  }
});

client.login(process.env.DISCORD_TOKEN);
