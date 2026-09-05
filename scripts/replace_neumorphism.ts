// scripts/replace_neumorphism.ts
import * as fs from 'fs';
import * as path from 'path';

// Recursively collect .tsx, .ts, .jsx, .js files
function collectFiles(dir: string, filelist: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) continue;
      collectFiles(fullPath, filelist);
    } else if (entry.isFile()) {
      if (fullPath.match(/\.(tsx?|jsx?)$/)) {
        filelist.push(fullPath);
      }
    }
  }
  return filelist;
}

const projectRoot = path.resolve(__dirname, '..');
const files = collectFiles(projectRoot);

function getThemeVariable(filePath: string, type: 'main' | 'accent'): string {
  const lower = filePath.toLowerCase();
  const isInvestor = lower.includes('/investor/') || lower.includes('investor');
  const isStartup = lower.includes('/startup/') || lower.includes('startup');
  if (type === 'main') {
    if (isInvestor) return 'var(--text-main-inv)';
    if (isStartup) return 'var(--text-main-stu)';
    return 'var(--text-main-inv)';
  } else {
    if (isInvestor) return 'var(--text-accent-inv)';
    if (isStartup) return 'var(--text-accent-stu)';
    return 'var(--text-accent-inv)';
  }
}

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  const themeMain = getThemeVariable(file, 'main');
  const themeAccent = getThemeVariable(file, 'accent');
  const replacements: [RegExp, string][] = [
    [/text-white\b/g, `text-[${themeMain}]`],
    [/text-slate-200\b/g, `text-[${themeMain}]`],
    [/text-slate-300\b/g, `text-[${themeMain}]`],
    [/text-slate-400\b/g, `text-[${themeMain}]`],
    [/text-\[#FFFFFF\]/g, `text-[${themeMain}]`],
    [/text-cyan-500\b/g, `text-[${themeAccent}]`],
    [/text-violet-500\b/g, `text-[${themeAccent}]`],
    [/text-emerald-500\b/g, `text-[${themeAccent}]`],
    [/text-([\w-]+)\/70/g, `text-[${themeMain}]/70`],
    [/text-([\w-]+)\/80/g, `text-[${themeMain}]/80`]
  ];
  replacements.forEach(([regex, repl]) => {
    content = content.replace(regex, repl);
  });

  // Remove dark backgrounds and gradients
  content = content.replace(/bg-\[#020617\]/g, '');
  content = content.replace(/bg-slate-950\b/g, '');
  content = content.replace(/bg-slate-900\b/g, '');
  content = content.replace(/bg-gradient-to-r[^"`']*/g, '');

  // Remove shadows
  content = content.replace(/drop-shadow-2xl\b/g, '');
  content = content.replace(/text-shadow[^\s]+/g, '');

  // Add theme wrapper if missing
  if (content.includes('<main') && !content.includes('theme-investor') && !content.includes('theme-startup')) {
    const themeClass = getThemeVariable(file, 'main').includes('inv') ? 'theme-investor' : 'theme-startup';
    content = content.replace('<main', `<div className="${themeClass}"><main`);
    content = content.replace('</main>', '</main></div>');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
