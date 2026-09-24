const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// أيدي الرتب المخصصة للأونرية
const OWNER_ROLES = ['1536796640399200447', '1539678217311617195'];

client.once('ready', () => {
  console.log(`🚀 تم تشغيل البوت بنجاح: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith('+')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const sendError = (text) => message.reply(`❌ **خطأ:** ${text}`).catch(() => {});

  // دالة للتحقق إذا كان المستخدم يملك رتبة الأونر أو صلاحية أدمن
  const isOwner = message.member.permissions.has(PermissionFlagsBits.Administrator) || message.member.roles.cache.some(role => OWNER_ROLES.includes(role.id));

  // أمر المساعدة: +help
  if (command === 'help' || command === 'اوامر') {
    const helpEmbed = new EmbedBuilder()
      .setTitle('📜 قائمة أوامر بوت السيرفر')
      .setDescription('جميع الأوامر تبدأ بعلامة الترقيم `+` ومكتوبة بوضوح للنسخ والاستخدام الفوري.')
      .setColor(0x3498DB)
      .addFields(
        {
          name: '👤 **أوامر الأعضاء العامة:**',
          value: 
            '`+help` - لعرض قائمة الأوامر هذه\n' +
            '`+بينج` - لفحص سرعة استجابة البوت'
        },
        {
          name: '👑 **أوامر الأونرية والإدارة (خاصة برتب الصلاحيات):**',
          value: 
            '`+قفل` - لقفل الشات الحالي\n' +
            '`+فتح` - لفتح الشات الحالي\n' +
            '`+اخفاء` - لإخفاء الروم عن الجميع\n' +
            '`+اظهار` - لإظهار الروم للجميع\n' +
            '`+رول @العضو اسم_الرول` - لإعطاء رتبة لعضو\n' +
            '`+شيل @العضو اسم_الرول` - لسحب رتبة من عضو\n' +
            '`+تف @العضو [السبب]` - لحظر العضو (Ban)\n' +
            '`+برا @العضو [السبب]` - لطرد العضو (Kick)\n' +
            '`+مسح [العدد]` - لمسح الرسائل (بين 1 و 100)\n' +
            '`+جيفواي [الدقائق] [الجائزة]` - لبدأ مسابقة جيفواي مع زر مشاركة'
        }
      )
      .setTimestamp()
      .setFooter({ text: 'نظام إدارة السيرفرات الاحترافي' });

    return message.reply({ embeds: [helpEmbed] });
  }

  // 1. أمر قفل الشات: +قفل
  if (command === 'قفل') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة المحددة فقط!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
      await message.reply('🔒 **تم قفل الروم بنجاح.**');
    } catch (e) {
      sendError('حدث خطأ، تأكد أن رتبة البوت أعلى.');
    }
  }

  // 2. أمر فتح الشات: +فتح
  if (command === 'فتح') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة المحددة فقط!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
      await message.reply('🔓 **تم فتح الروم بنجاح.**');
    } catch (e) {
      sendError('حدث خطأ في تعديل الصلاحيات.');
    }
  }

  // 3. أمر إخفاء الروم: +اخفاء
  if (command === 'اخفاء') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة المحددة فقط!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false });
      await message.reply('🙈 **تم إخفاء الروم عن الجميع.**');
    } catch (e) {
      sendError('فشل إخفاء الروم.');
    }
  }

  // 4. أمر إظهار الروم: +اظهار
  if (command === 'اظهار') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة المحددة فقط!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: true });
      await message.reply('🐵 **تم إظهار الروم للجميع.**');
    } catch (e) {
      sendError('فشل إظهار الروم.');
    }
  }

  // 5. أمر إعطاء رول: +رول @العضو اسم_الرول
  if (command === 'رول') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة المحددة فقط!');
    const targetMember = message.mentions.members.first();
    const roleArg = args.slice(1).join(' ').replace(/[<@&>]/g, '');
    const role = message.guild.roles.cache.get(roleArg) || message.guild.roles.cache.find(r => r.name.toLowerCase().includes(roleArg.toLowerCase()));

    if (!targetMember || !role) return sendError('اكتب الأمر هكذا: `+رول @العضو اسم_الرول`');
    if (message.guild.members.me.roles.highest.position <= role.position) return sendError('رتبة البوت أقل من هذه الرتبة!');

    try {
      await targetMember.roles.add(role);
      await message.reply(`✅ تم إعطاء رول **${role.name}** للعضو ${targetMember}.`);
    } catch (e) {
      sendError('حدث خطأ أثناء إعطاء الرتبة.');
    }
  }

  // 6. أمر شيل رول: +شيل @العضو اسم_الرول
  if (command === 'شيل') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة المحددة فقط!');
    const targetMember = message.mentions.members.first();
    const roleArg = args.slice(1).join(' ').replace(/[<@&>]/g, '');
    const role = message.guild.roles.cache.get(roleArg) || message.guild.roles.cache.find(r => r.name.toLowerCase().includes(roleArg.toLowerCase()));

    if (!targetMember || !role) return sendError('اكتب الأمر هكذا: `+شيل @العضو اسم_الرول`');
    if (message.guild.members.me.roles.highest.position <= role.position) return sendError('رتبة البوت أقل من هذه الرتبة!');

    try {
      await targetMember.roles.remove(role);
      await message.reply(`🗑️ تم إزالة رول **${role.name}** من العضو ${targetMember}.`);
    } catch (e) {
      sendError('حدث خطأ أثناء سحب الرتبة.');
    }
  }

  // 7. أمر البان (تف): +تف @العضو [السبب]
  if (command === 'تف') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة المحددة فقط!');
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]?.replace(/[<@!>]/g, ''));
    if (!target) return sendError('اكتب الأمر هكذا: `+تف @العضو [السبب]`');
    if (!target.bannable || target.roles.highest.position >= message.member.roles.highest.position) return sendError('لا يمكنني حظر هذا العضو!');

    const reason = args.slice(1).join(' ') || 'بدون سبب';
    try {
      await target.ban({ reason });
      await message.reply(`🔨 **تم حظر العضو ${target.user.tag}.**`);
    } catch (e) {
      sendError('حدث خطأ أثناء الحظر.');
    }
  }

  // 8. أمر الكيك (برا): +برا @العضو [السبب]
  if (command === 'برا') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة المحددة فقط!');
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]?.replace(/[<@!>]/g, ''));
    if (!target) return sendError('اكتب الأمر هكذا: `+برا @العضو [السبب]`');
    if (!target.kickable || target.roles.highest.position >= message.member.roles.highest.position) return sendError('لا يمكنني طرد هذا العضو!');

    const reason = args.slice(1).join(' ') || 'بدون سبب';
    try {
      await target.kick(reason);
      await message.reply(`👢 **تم طرد العضو ${target.user.tag}.**`);
    } catch (e) {
      sendError('حدث خطأ أثناء الطرد.');
    }
  }

  // 9. أمر مسح الشات: +مسح [العدد]
  if (command === 'مسح' || command === 'كلير') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة المحددة فقط!');
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

  // 10. أمر الجيفواي: +جيفواي [الدقائق] [الجائزة]
  if (command === 'جيفواي') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة المحددة فقط!');
    
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

  // 11. أمر بينج: +بينج (متاح للجميع)
  if (command === 'بينج') {
    const msg = await message.reply('🏓 جاري القياس...');
    const ping = msg.createdTimestamp - message.createdTimestamp;
    await msg.edit(`🏓 **البينج:** \`${ping}ms\` ⚡`);
  }
});

client.login(process.env.DISCORD_TOKEN);
