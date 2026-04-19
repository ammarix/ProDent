const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = {
  'bg-white': 'bg-white dark:bg-gray-800',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-700',
  'text-gray-800': 'text-gray-800 dark:text-gray-100',
  'text-gray-700': 'text-gray-700 dark:text-gray-200',
  'text-gray-600': 'text-gray-600 dark:text-gray-300',
  'text-gray-500': 'text-gray-500 dark:text-gray-400',
  'text-gray-400': 'text-gray-400 dark:text-gray-500',
  'border-gray-50': 'border-gray-50 dark:border-gray-700',
  'border-gray-100': 'border-gray-100 dark:border-gray-700',
  'border-gray-200': 'border-gray-200 dark:border-gray-600',
  'bg-\\[#fffcf5\\]': 'bg-[#fffcf5] dark:bg-amber-900/20',
  'bg-\\[#f8f7ff\\]': 'bg-[#f8f7ff] dark:bg-indigo-900/20',
  'bg-indigo-50': 'bg-indigo-50 dark:bg-indigo-900/30',
  'border-indigo-200': 'border-indigo-200 dark:border-indigo-700',
  'border-indigo-100': 'border-indigo-100 dark:border-indigo-800',
  'bg-red-50': 'bg-red-50 dark:bg-red-900/20',
  'bg-emerald-50': 'bg-emerald-50 dark:bg-emerald-900/20',
  'bg-amber-50': 'bg-amber-50 dark:bg-amber-900/20',
  'bg-transparent': 'bg-transparent dark:text-white'
};

for (const [key, value] of Object.entries(replacements)) {
  // Use regex to replace whole words/classes where appropriate
  // For classes with brackets, we need to be careful
  const regex = new RegExp(key + '(?![\\w\\-])', 'g');
  content = content.replace(regex, value);
}

// Fix potential double replacements if script is run multiple times
content = content.replace(/dark:bg-gray-800 dark:bg-gray-800/g, 'dark:bg-gray-800');
// etc... just in case

fs.writeFileSync('src/App.tsx', content);
console.log('Replacements done.');
