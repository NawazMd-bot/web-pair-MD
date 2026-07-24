const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');
const settings = require('../settings');

const LOGO_TYPES = {
  "neon": { query: ["neon cyberpunk", "neon lights city", "cyberpunk glow", "neon sign dark"] },
  "glitch": { query: ["glitch effect", "rgb error", "digital distortion", "screen glitch"] },
  "gold": { query: ["gold texture", "luxury gold", "gold shine", "gold metal"] },
  "3dtext": { query: ["3d text", "extruded text", "3d render", "modern typography"] },
  "fire": { query: ["fire flames", "burning fire", "heat flames", "red fire"] },
  "water": { query: ["water drops", "rain drops", "liquid splash", "water glass"] },
  "galaxy": { query: ["galaxy stars", "cosmic sky", "space nebula", "deep galaxy"] },
  "marvel": { query: ["marvel comics", "superhero style", "comic book art", "avengers style"] },
  "avengers": { query: ["avengers logo", "superhero team", "comic style", "heroic"] },
  "transformer": { query: ["robot transformer", "metal robot", "futuristic robot", "ai robot"] },
  "blackpink": { query: ["pink aesthetic", "kpop style", "blackpink vibe", "pink neon"] },
  "gradient": { query: ["color gradient", "multicolor light", "rainbow glow", "vibrant colors"] },
  "luxury": { query: ["luxury background", "premium texture", "elegant design", "rich style"] },
  "royal": { query: ["royal crown", "king style", "golden luxury", "majestic"] },
  "metal": { query: ["metal texture", "steel dark", "industrial metal", "iron texture"] },
  "steel": { query: ["brushed steel", "metal surface", "industrial steel", "polished metal"] },
  "chrome": { query: ["chrome reflection", "shiny metal", "mirror finish", "polished chrome"] },
  "glossy": { query: ["glossy surface", "shiny reflection", "smooth texture", "polished"] },
};

const fonts = ["Arial", "Impact", "Georgia", "Verdana"];

async function logoMaker(sock, from, msg, type, text) {
    if (!text) return await sock.sendMessage(from, { text: `❌ Usage: .${type} Name|Tagline` }, { quoted: msg });

    try {
        const config = LOGO_TYPES[type.toLowerCase()];
        if (!config) return;

        await sock.sendMessage(from, { react: { text: '🎨', key: msg.key } });

        let [mainText, subText] = text.split("|");
        if (!subText) subText = "";

        const width = 1200;
        const height = 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        
        // Using a public Pixabay API key for demonstration (User should ideally provide their own)
        const api = "54164246-c83b8dee398b874d43650c040"; 
        const q = config.query[Math.floor(Math.random() * config.query.length)];

        const res = await axios.get(
            `https://pixabay.com/api/?key=${api}&q=${encodeURIComponent(q)}&image_type=photo&orientation=horizontal&per_page=20`
        );

        const hits = res.data.hits;
        if (!hits || hits.length === 0) throw new Error("No background images found.");
        
        const randomImg = hits[Math.floor(Math.random() * hits.length)];
        const bg = await loadImage(randomImg.largeImageURL);

        ctx.drawImage(bg, 0, 0, width, height);
        
        // Dark overlay
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, width, height);

        // Text styling
        const font = fonts[Math.floor(Math.random() * fonts.length)];
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let fontSize = 120;
        if (mainText.length > 15) fontSize = 80;
        
        ctx.font = `bold ${fontSize}px ${font}`;
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "white";
        ctx.fillText(mainText.toUpperCase(), width / 2, height / 2);

        if (subText) {
            ctx.font = `italic 40px ${font}`;
            ctx.fillText(subText, width / 2, height / 2 + 100);
        }

        // Branding
        ctx.font = "20px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(`NAWAZ MD BOT`, width - 150, height - 30);

        const buffer = canvas.toBuffer("image/png");

        await sock.sendMessage(from, {
            image: buffer,
            caption: `✨ *${type.toUpperCase()} LOGO GENERATED*\n\nMade by *NAWAZ MD*`
        }, { quoted: msg });

    } catch (e) {
        console.error("LOGO ERROR:", e.message);
        await sock.sendMessage(from, { text: "❌ Error generating logo: " + e.message }, { quoted: msg });
    }
}

module.exports = logoMaker;
