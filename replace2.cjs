const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = {
  'bg-gray-100(?! dark:bg)': 'bg-gray-100 dark:bg-gray-700',
  'hover:bg-gray-100(?! dark:hover:bg)': 'hover:bg-gray-100 dark:hover:bg-gray-600',
  'hover:bg-gray-200(?! dark:hover:bg)': 'hover:bg-gray-200 dark:hover:bg-gray-600',
  'bg-gray-200(?! dark:bg)': 'bg-gray-200 dark:bg-gray-600',
  'text-indigo-600(?! dark:text)': 'text-indigo-600 dark:text-indigo-400',
  'hover:bg-indigo-50(?! dark:hover:bg)': 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
  'text-indigo-800(?! dark:text)': 'text-indigo-800 dark:text-indigo-300',
  'text-amber-600(?! dark:text)': 'text-amber-600 dark:text-amber-400',
  'text-emerald-600(?! dark:text)': 'text-emerald-600 dark:text-emerald-400',
  'text-red-600(?! dark:text)': 'text-red-600 dark:text-red-400',
  'border-indigo-50(?! dark:border)': 'border-indigo-50 dark:border-indigo-900/50',
  'border-amber-100(?! dark:border)': 'border-amber-100 dark:border-amber-900/50',
  'bg-white(?! dark:bg)': 'bg-white dark:bg-gray-800',
  'bg-gray-50(?! dark:bg)': 'bg-gray-50 dark:bg-gray-700',
  'border-gray-50(?! dark:border)': 'border-gray-50 dark:border-gray-700',
  'border-gray-100(?! dark:border)': 'border-gray-100 dark:border-gray-700',
  'border-gray-200(?! dark:border)': 'border-gray-200 dark:border-gray-600',
  'text-gray-800(?! dark:text)': 'text-gray-800 dark:text-gray-100',
  'text-gray-700(?! dark:text)': 'text-gray-700 dark:text-gray-200',
  'text-gray-600(?! dark:text)': 'text-gray-600 dark:text-gray-300',
  'text-gray-500(?! dark:text)': 'text-gray-500 dark:text-gray-400',
  'text-gray-400(?! dark:text)': 'text-gray-400 dark:text-gray-500',
};

for (const [key, value] of Object.entries(replacements)) {
  const regex = new RegExp(key, 'g');
  content = content.replace(regex, value);
}

fs.writeFileSync('src/App.tsx', content);
console.log('Replacements done.');
