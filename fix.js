import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/dark:text-gray-500 dark:text-gray-400 dark:text-gray-500/g, 'dark:text-gray-500');
content = content.replace(/dark:text-gray-400 dark:text-gray-500 dark:text-gray-400/g, 'dark:text-gray-400');
content = content.replace(/dark:text-gray-500 dark:text-gray-400/g, 'dark:text-gray-500');
content = content.replace(/dark:text-gray-400 dark:text-gray-500/g, 'dark:text-gray-400');
fs.writeFileSync('src/App.tsx', content);
