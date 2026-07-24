const fs = require('fs-extra');
const path = require('path');

const configPath = path.join(__dirname, '../data/welcome.json');

function getWelcomeConfig() {
    if (!fs.existsSync(configPath)) return {};
    return fs.readJsonSync(configPath);
}

function saveWelcomeConfig(config) {
    fs.ensureDirSync(path.dirname(configPath));
    fs.writeJsonSync(configPath, config, { spaces: 2 });
}

async function welcomeCommand(sock, from, msg, isAdmin, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "❌ This command is for admins only." }, { quoted: msg });

    const action = args[0]?.toLowerCase();
    const config = getWelcomeConfig();

    if (action === 'on') {
        config[from] = config[from] || { enabled: true, message: "Welcome to the group! @user" };
        config[from].enabled = true;
        saveWelcomeConfig(config);
        await sock.sendMessage(from, { text: "✅ Welcome messages enabled for this group!" }, { quoted: msg });
    } else if (action === 'off') {
        if (config[from]) config[from].enabled = false;
        saveWelcomeConfig(config);
        await sock.sendMessage(from, { text: "❌ Welcome messages disabled for this group!" }, { quoted: msg });
    } else if (action === 'set') {
        const welcomeMsg = args.slice(1).join(' ');
        if (!welcomeMsg) return await sock.sendMessage(from, { text: "❌ Please provide a welcome message. Use @user to mention the new member." }, { quoted: msg });
        
        config[from] = config[from] || { enabled: true };
        config[from].message = welcomeMsg;
        saveWelcomeConfig(config);
        await sock.sendMessage(from, { text: "✅ Welcome message updated!" }, { quoted: msg });
    } else {
        await sock.sendMessage(from, { text: "❌ Usage:\n.welcome on - Enable\n.welcome off - Disable\n.welcome set [message] - Set custom message" }, { quoted: msg });
    }
}

module.exports = {
    welcomeCommand,
    getWelcomeConfig
};
