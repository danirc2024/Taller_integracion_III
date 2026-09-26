const fs = require('fs');
const files = [
  'src/components/TopNav.tsx',
  'src/pages/Profile.tsx',
  'src/pages/Crowdsourcing.tsx',
  'src/pages/History.tsx',
  'src/pages/RouteViewer.tsx',
  'src/pages/Chatbot.tsx',
  'src/components/Sidebar.tsx'
];

const colorRegex = /(emerald|indigo|rose|amber|purple|teal|blue|green)/g;

const replacements = [
    [/bg-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+(\/\d+)?/g, 'bg-primary'],
    [/dark:bg-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+(\/\d+)?/g, ''],
    [/hover:bg-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+/g, 'hover:bg-primary/90'],
    [/dark:hover:bg-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+/g, ''],
    [/text-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+/g, 'text-primary'],
    [/dark:text-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+/g, ''],
    [/border-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+(\/\d+)?/g, 'border-border'],
    [/dark:border-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+(\/\d+)?/g, ''],
    [/hover:border-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+/g, 'hover:border-foreground'],
    [/dark:hover:border-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+/g, ''],
    [/focus:ring-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+/g, 'focus:ring-ring'],
    [/focus-within:ring-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+(\/\d+)?/g, 'focus-within:ring-ring'],
    [/focus-within:border-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+/g, 'focus-within:border-border'],
    [/from-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+(\/\d+)?/g, 'from-secondary'],
    [/dark:from-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+(\/\d+)?/g, ''],
    [/to-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+/g, 'to-background'],
    [/shadow-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+(\/\d+)?/g, 'shadow-[4px_4px_0px_var(--color-border)]'],
    [/accent-(emerald|indigo|rose|amber|purple|teal|blue|green)-\d+/g, 'accent-black dark:accent-white'],
    [/text-white/g, 'text-primary-foreground'],
];

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');
    replacements.forEach(([p, r]) => {
        content = content.replace(p, r);
    });
    // Add neobrutalist borders and shadows to primary buttons and key elements if they don't have them
    // It's safer not to blindly add shadow to all `bg-primary` because we did it in fix-colors previously.
    // Let's just do a basic cleanup of multiple spaces:
    content = content.replace(/ +/g, ' ').replace(/ "/g, '"').replace(/" /g, '"');
    
    // For TopNav Assistant button specifically:
    content = content.replace(/bg-primary hover:bg-primary\/90 text-primary-foreground/g, 'bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-border shadow-[4px_4px_0px_var(--color-border)]');
    
    // Quick fix to avoid multiple duplicate shadows if we run it multiple times
    content = content.replace(/(border-2 border-border shadow-\[4px_4px_0px_var\(--color-border\)\] )+/g, 'border-2 border-border shadow-[4px_4px_0px_var(--color-border)] ');
    
    fs.writeFileSync(f, content);
});
console.log('Colors replaced in all files');
