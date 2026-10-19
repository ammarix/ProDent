const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.resolve(__dirname, '../public');
const assetsDir = path.resolve(__dirname, '../src/assets');
const distDir = path.resolve(__dirname, '../dist');

const userIconSvgPath = path.join(assetsDir, 'user-icon.svg');
const userIconPngPath = path.join(assetsDir, 'user-icon.png');
const userMaskablePath = path.join(assetsDir, 'user-icon-maskable.png');

const ICON_VERSION = 'v=5';

async function generateAll() {
  console.log('Generating authentic icons and manifest from user-provided image assets...');

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  let iconBuffer;
  let isSvg = false;

  if (fs.existsSync(userIconSvgPath)) {
    console.log('Found SVG source icon at:', userIconSvgPath);
    iconBuffer = fs.readFileSync(userIconSvgPath);
    isSvg = true;
    // Copy real SVG directly to public
    fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconBuffer);
    fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), iconBuffer);
  } else if (fs.existsSync(userIconPngPath)) {
    console.log('Found PNG source icon at:', userIconPngPath);
    iconBuffer = fs.readFileSync(userIconPngPath);
    const base64Png = iconBuffer.toString('base64');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image width="512" height="512" href="data:image/png;base64,${base64Png}" />
</svg>`;
    fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
    fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), svgContent);
  } else {
    console.error('No source icon found at user-icon.svg or user-icon.png');
    process.exit(1);
  }

  const maskableBuffer = fs.existsSync(userMaskablePath)
    ? fs.readFileSync(userMaskablePath)
    : iconBuffer;

  const sharpInput = (buffer) => isSvg ? sharp(buffer, { density: 300 }) : sharp(buffer);

  // 1. Standard PWA 512x512 & 192x192 (purpose: "any")
  await sharpInput(iconBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  await sharpInput(iconBuffer)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 2. Android Maskable PWA 512x512 & 192x192 (purpose: "maskable" safe zone)
  await sharpInput(maskableBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  await sharpInput(maskableBuffer)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-192x192.png'));

  // 3. Apple Touch Icon 180x180 (iOS home screen)
  await sharpInput(maskableBuffer)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 4. Browser Favicons (32x32, 16x16, 48x48 .ico)
  await sharpInput(iconBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  await sharpInput(iconBuffer)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  await sharpInput(iconBuffer)
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  // 5. Static Web App Manifest in public/manifest.webmanifest (works in both dev preview & production)
  const manifestContent = {
    id: '/',
    name: 'ProDent - إدارة عيادة الأسنان',
    short_name: 'ProDent',
    description: 'نظام شامل لإدارة عيادات الأسنان وحسابات المرضى والمواعيد.',
    theme_color: '#0f1e47',
    background_color: '#0f1e47',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      {
        src: `/pwa-192x192.png?${ICON_VERSION}`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: `/pwa-512x512.png?${ICON_VERSION}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: `/pwa-maskable-192x192.png?${ICON_VERSION}`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: `/pwa-maskable-512x512.png?${ICON_VERSION}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };

  fs.writeFileSync(
    path.join(publicDir, 'manifest.webmanifest'),
    JSON.stringify(manifestContent, null, 2)
  );

  // 6. Synchronize all generated files into dist/
  const filesToCopy = [
    'icon.svg',
    'icon-maskable.svg',
    'pwa-512x512.png',
    'pwa-192x192.png',
    'pwa-maskable-512x512.png',
    'pwa-maskable-192x192.png',
    'apple-touch-icon.png',
    'favicon-32x32.png',
    'favicon-16x16.png',
    'favicon.ico',
    'manifest.webmanifest'
  ];

  for (const file of filesToCopy) {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    fs.copyFileSync(src, dest);
  }

  console.log('All authentic icons and manifest.webmanifest generated and synchronized successfully!');
}

generateAll().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
