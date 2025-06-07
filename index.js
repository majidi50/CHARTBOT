const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');

const { state, saveState } = useSingleFileAuthState('./creds.json');

async function startBot() {
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      console.log('⚠️ Connection closed, reconnecting...', lastDisconnect?.error);
    } else if (connection === 'open') {
      console.log('✅ Bot imeunganishwa!');
      console.log('🔢 Namba ya bot:', sock.user.id);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    let reply = '';

    switch (text.toLowerCase()) {
      case 'huduma':
        reply = `👋 Karibu PRINCE LOWE BOT\n\n📌 Huduma zangu:\n1. 🤖 Kutengeneza Bot\n2. 🌐 Kutengeneza Website\n3. 🚀 Kudeploy Bot\n4. 💼 Bot za Biashara\n\nTuma namba *1*, *2*, *3*, au *4* kujifunza zaidi.`;
        break;
      case '1':
        reply = `🤖 Huduma ya Kutengeneza Bot\nNinatengeneza bot za WhatsApp za biashara.`;
        break;
      case '2':
        reply = `🌐 Huduma ya Kutengeneza Website\nNinaweza kukutengenezea website za kisasa.`;
        break;
      case '3':
        reply = `🚀 Huduma ya Kudeploy Bot\nNasaidia kuweka bot zako online 24/7.`;
        break;
      case '4':
        reply = `💼 Bot za Biashara\nBot zinazojibu wateja na kuboresha huduma zako.`;
        break;
      default:
        reply = `👋 Karibu kwenye PRINCE LOWE BOT\nTuma *huduma* kuona huduma zangu.`;
    }

    await sock.sendMessage(sender, { text: reply });
  });
}

startBot();
