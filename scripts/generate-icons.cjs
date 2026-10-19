const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. SVG for Brand / Dental Clinic
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6762e3"/>
      <stop offset="100%" stop-color="#4640bf"/>
    </linearGradient>
    <linearGradient id="toothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0f2fe"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#241e73" flood-opacity="0.35"/>
    </filter>
  </defs>
  
  <!-- Rounded Background -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  
  <!-- Subtle accent circle -->
  <circle cx="256" cy="256" r="180" fill="#ffffff" opacity="0.06"/>
  
  <!-- Stylized Tooth Path -->
  <g filter="url(#shadow)">
    <path d="M256,105 C210,105 158,118 140,158 C120,202 128,245 146,288 C162,328 178,375 190,410 C198,433 216,435 228,418 C242,398 250,345 256,345 C262,345 270,398 284,418 C296,435 314,433 322,410 C334,375 350,328 366,288 C384,245 392,202 372,158 C354,118 302,105 256,105 Z" 
          fill="url(#toothGrad)"/>
    <!-- Medical Dental Sparkle/Cross inside tooth -->
    <path d="M256,180 L256,260 M216,220 L296,220" stroke="#5a55d2" stroke-width="22" stroke-linecap="round"/>
    <circle cx="320" cy="170" r="10" fill="#38bdf8" />
  </g>
</svg>`;

// Maskable SVG with safe margin (15% padding)
const maskableSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6762e3"/>
      <stop offset="100%" stop-color="#4640bf"/>
    </linearGradient>
    <linearGradient id="toothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0f2fe"/>
    </linearGradient>
  </defs>
  
  <!-- Full bleed for maskable -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>
  
  <!-- Scaled Tooth (safe zone within 80%) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <path d="M256,105 C210,105 158,118 140,158 C120,202 128,245 146,288 C162,328 178,375 190,410 C198,433 216,435 228,418 C242,398 250,345 256,345 C262,345 270,398 284,418 C296,435 314,433 322,410 C334,375 350,328 366,288 C384,245 392,202 372,158 C354,118 302,105 256,105 Z" 
          fill="url(#toothGrad)"/>
    <path d="M256,180 L256,260 M216,220 L296,220" stroke="#5a55d2" stroke-width="22" stroke-linecap="round"/>
    <circle cx="320" cy="170" r="10" fill="#38bdf8" />
  </g>
</svg>`;

async function buildIcons() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
  console.log('Saved icon.svg');

  const svgBuffer = Buffer.from(svgContent);
  const maskableSvgBuffer = Buffer.from(maskableSvgContent);

  // 192x192
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Saved pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Saved pwa-512x512.png');

  // Maskable 512x512
  await sharp(maskableSvgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Saved pwa-maskable-512x512.png');

  // Apple touch icon 180x180
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Saved apple-touch-icon.png');

  // Favicon 64x64
  await sharp(svgBuffer).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Saved favicon.ico');
}

buildIcons().catch(err => {
  console.error('Error generating icons', err);
  process.exit(1);
});
