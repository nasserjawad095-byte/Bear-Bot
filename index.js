const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const OWNER_ROLES = ['1536796640399200447', '1539678217311617195'];
const TICKET_CHANNEL_ID = '1552755184814530600';
const SUPPORT_ROLE_ID = '1536796640399200447';

client.once('ready', async () => {
  console.log(`🚀 تم تشغيل البوت بنجاح: ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(TICKET_CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      const messages = await channel.messages.fetch({ limit: 10 });
      const hasTicketMsg = messages.some(m => m.author.id === client.user.id && m.components.length > 0);

      if (!hasTicketMsg) {
        const embed = new EmbedBuilder()
          .setTitle('🎫 نظام التذاكر والدعم الفني')
          .setDescription('لفتح تذاكر الدعم الفني، الاستفسارات، أو إتمام عمليات الشراء، يرجى الضغط على الزر بالأسفل.')
          .setColor(0x2B2D31)
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('فتح تكت جديدة')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎫')
        );

        await channel.send({ embeds: [embed], components: [row] });
      }
    }
  } catch (e) {
    console.log('لم يتم العثور على روم التكت أو لا يمكن إرسال الرسالة فيها.');
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith('+')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const sendError = (text) => message.reply(`❌ **خطأ:** ${text}`).catch(() => {});
  const isOwner = message.member.permissions.has(PermissionFlagsBits.Administrator) || message.member.roles.cache.some(role => OWNER_ROLES.includes(role.id));

  if (command === 'help' || command === 'اوامر') {
    const helpEmbed = new EmbedBuilder()
      .setTitle('📜 قائمة أوامر بوت السيرفر')
      .setDescription('جميع الأوامر تبدأ بعلامة الترقيم `+` ومكتوبة بوضوح للنسخ والاستخدام الفوري.')
      .setColor(0x3498DB)
      .addFields(
        {
          name: '👤 **أوامر الأعضاء العامة:**',
          value: '`+help` - لعرض قائمة الأوامر هذه\n`+بينج` - لفحص سرعة استجابة البوت'
        },
        {
          name: '👑 **أوامر الأونرية والإدارة:**',
          value: '`+قفل` - لقفل الشات\n`+فتح` - لفتح الشات\n`+اخفاء` - لإخفاء الروم\n`+اظهار` - لإظهار الروم\n`+رول @العضو اسم_الرول` - لإعطاء رتبة\n`+شيل @العضو اسم_الرول` - لسحب رتبة\n`+تف @العضو [السبب]` - حظر عضو\n`+برا @العضو [السبب]` - طرد عضو\n`+مسح [العدد]` - مسح الرسائل\n`+جيفواي [الدقائق] [الجائزة]` - مسابقة جيفواي'
        }
      )
      .setTimestamp();

    return message.reply({ embeds: [helpEmbed] });
  }

  if (command === 'قفل') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة فقط!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
      await message.reply('🔒 **تم قفل الروم بنجاح.**');
    } catch (e) {
      sendError('حدث خطأ.');
    }
  }

  if (command === 'فتح') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة فقط!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
      await message.reply('🔓 **تم فتح الروم بنجاح.**');
    } catch (e) {
      sendError('حدث خطأ.');
    }
  }

  if (command === 'اخفاء') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة فقط!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false });
      await message.reply('🙈 **تم إخفاء الروم عن الجميع.**');
    } catch (e) {
      sendError('فشل الإخفاء.');
    }
  }

  if (command === 'اظهار') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة فقط!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: true });
      await message.reply('🐵 **تم إظهار الروم للجميع.**');
    } catch (e) {
      sendError('فشل الإظهار.');
    }
  }

  if (command === 'رول') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة فقط!');
    const targetMember = message.mentions.members.first();
    const roleArg = args.slice(1).join(' ').replace(/[<@&>]/g, '');
    const role = message.guild.roles.cache.get(roleArg) || message.guild.roles.cache.find(r => r.name.toLowerCase().includes(roleArg.toLowerCase()));
    if (!targetMember || !role) return sendError('اكتب: `+رول @العضو اسم_الرول`');
    if (message.guild.members.me.roles.highest.position <= role.position) return sendError('رتبة البوت أقل من هذه الرتبة!');

    try {
      await targetMember.roles.add(role);
      await message.reply(`✅ تم إعطاء رول **${role.name}** للعضو ${targetMember}.`);
    } catch (e) {
      sendError('حدث خطأ.');
    }
  }

  if (command === 'شيل') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة فقط!');
    const targetMember = message.mentions.members.first();
    const roleArg = args.slice(1).join(' ').replace(/[<@&>]/g, '');
    const role = message.guild.roles.cache.get(roleArg) || message.guild.roles.cache.find(r => r.name.toLowerCase().includes(roleArg.toLowerCase()));
    if (!targetMember || !role) return sendError('اكتب: `+شيل @العضو اسم_الرول`');
    if (message.guild.members.me.roles.highest.position <= role.position) return sendError('رتبة البوت أقل من هذه الرتبة!');

    try {
      await targetMember.roles.remove(role);
      await message.reply(`🗑️ تم إزالة رول **${role.name}** من العضو ${targetMember}.`);
    } catch (e) {
      sendError('حدث خطأ.');
    }
  }

  if (command === 'تف') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة فقط!');
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]?.replace(/[<@!>]/g, ''));
    if (!target) return sendError('اكتب: `+تف @العضو [السبب]`');
    if (!target.bannable || target.roles.highest.position >= message.member.roles.highest.position) return sendError('لا يمكنني حظر هذا العضو!');
    const reason = args.slice(1).join(' ') || 'بدون سبب';
    try {
      await target.ban({ reason });
      await message.reply(`🔨 **تم حظر العضو ${target.user.tag}.**`);
    } catch (e) {
      sendError('حدث خطأ.');
    }
  }

  if (command === 'برا') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة فقط!');
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]?.replace(/[<@!>]/g, ''));
    if (!target) return sendError('اكتب: `+برا @العضو [السبب]`');
    if (!target.kickable || target.roles.highest.position >= message.member.roles.highest.position) return sendError('لا يمكنني طرد هذا العضو!');
    const reason = args.slice(1).join(' ') || 'بدون سبب';
    try {
      await target.kick(reason);
      await message.reply(`👢 **تم طرد العضو ${target.user.tag}.**`);
    } catch (e) {
      sendError('حدث خطأ.');
    }
  }

  if (command === 'مسح' || command === 'كلير') {
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة فقط!');
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
    if (!isOwner) return sendError('هذا الأمر مخصص للأونرية ورتب الإدارة فقط!');
    const timeMinutes = parseInt(args[0]);
    const prize = args.slice(1).join(' ');
    await message.delete().catch(() => {});
    if (isNaN(timeMinutes) || timeMinutes <= 0 || !prize) return message.channel.send('❌ اكتب هكذا: `+جيفواي 5 1000 روبكس`');

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
      if (entrants.size === 0) return giveawayMsg.edit({ embeds: [embed.setDescription(`🎁 الجائزة: **${prize}**\n❌ **انتهت المسابقة ولم يشارك أحد!**`).setColor(0xE74C3C)], components: [] }).catch(() => {});
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

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'create_ticket') {
      const guild = interaction.guild;
      const member = interaction.member;

      const existingChannel = guild.channels.cache.find(c => c.name === `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
      if (existingChannel) {
        return interaction.reply({ content: `❌ لديك تكت مفتوحة مسبقاً: ${existingChannel}`, ephemeral: true });
      }

      try {
        const ticketChannel = await guild.channels.create({
          name: `ticket-${member.user.username}`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: member.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            },
            {
              id: SUPPORT_ROLE_ID,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            },
            ...OWNER_ROLES.map(roleId => ({
              id: roleId,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            }))
          ],
        });

        const ticketEmbed = new EmbedBuilder()
          .setTitle('🎫 تكت جديدة')
          .setDescription(`أهلاً بك ${member}\nيرجى اختيار طريقة الدفع أو نوع الطلب من الأزرار بالأسفل ليتم خدمتتكم في أقرب وقت.`)
          .setColor(0x3498DB)
          .setTimestamp();

        const ticketRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('pay_method').setLabel('طريقة الدفع (بنكي / adamc)').setStyle(ButtonStyle.Secondary).setEmoji('💳'),
          new ButtonBuilder().setCustomId('claim_ticket').setLabel('استلام التكت').setStyle(ButtonStyle.Success).setEmoji('✅'),
          new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق وحذف التكت').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await ticketChannel.send({ content: `${member} | <@&${SUPPORT_ROLE_ID}>`, embeds: [ticketEmbed], components: [ticketRow] });
        await interaction.reply({ content: `✅ تم إنشاء تكت الخاص بك بنجاح: ${ticketChannel}`, ephemeral: true });
      } catch (e) {
        await interaction.reply({ content: '❌ حدث خطأ أثناء إنشاء التكت.', ephemeral: true });
      }
    }

    if (interaction.customId === 'pay_method') {
      const modal = new ModalBuilder()
        .setCustomId('payment_modal')
        .setTitle('اختيار طريقة الدفع وتفاصيل الطلب');

      const methodInput = new TextInputBuilder()
        .setCustomId('method_choice')
        .setLabel('طريقة الدفع (بنكي أو adamc)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('اكتب بنكي أو adamc')
        .setRequired(true);

      const detailsInput = new TextInputBuilder()
        .setCustomId('order_details')
        .setLabel('تفاصيل الطلب الخاص بك')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('اكتب ما تريد بضبط هنا...')
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(methodInput), new ActionRowBuilder().addComponents(detailsInput));
      await interaction.showModal(modal);
    }

    if (interaction.customId === 'claim_ticket') {
      const isSupport = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.some(r => OWNER_ROLES.includes(r.id) || r.id === SUPPORT_ROLE_ID);
      if (!isSupport) return interaction.reply({ content: '❌ هذا الزر مخصص للدعم الفني فقط!', ephemeral: true });

      const embed = EmbedBuilder.from(interaction.message.embeds[0]).addFields({ name: 'تم الاستلام بواسطة', value: `${interaction.user}`, inline: false });
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pay_method').setLabel('طريقة الدفع (بنكي / adamc)').setStyle(ButtonStyle.Secondary).setEmoji('💳'),
        new ButtonBuilder().setCustomId('claim_ticket').setLabel('تم الاستلام').setStyle(ButtonStyle.Success).setEmoji('✅').setDisabled(true),
        new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق وحذف التكت').setStyle(ButtonStyle.Danger).setEmoji('🔒')
      );

      await interaction.update({ embeds: [embed], components: [disabledRow] });
      await interaction.channel.send(`✅ تم استلام التكت بواسطة الدعم الفني: ${interaction.user}`);
    }

    if (interaction.customId === 'close_ticket') {
      await interaction.reply('🔒 جاري حذف التكت وإغلاقه خلال ثوانٍ...');
      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 3000);
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'payment_modal') {
      const method = interaction.fields.getTextInputValue('method_choice');
      const details = interaction.fields.getTextInputValue('order_details');

      const orderEmbed = new EmbedBuilder()
        .setTitle('📋 تفاصيل الطلب الجديد')
        .addFields(
          { name: '👤 صاحب الطلب', value: `${interaction.user}`, inline: true },
          { name: '💳 طريقة الدفع', value: method, inline: true },
          { name: '📝 التفاصيل', value: details, inline: false }
        )
        .setColor(0xE67E22)
        .setTimestamp();

      await interaction.channel.send({ embeds: [orderEmbed] });
      await interaction.reply({ content: '✅ تم إرسال تفاصيل الدفع والطلب بنجاح!', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
