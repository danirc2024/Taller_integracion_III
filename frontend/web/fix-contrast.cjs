const fs = require('fs');
let p = 'src/pages/Profile.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/border-border bg-primary dark:bg-primary text-primary dark:text-primary/g, 'border-border bg-primary text-primary-foreground shadow-[4px_4px_0px_var(--color-border)]');
// If dark classes were already removed by fix-colors.cjs:
c = c.replace(/border-border bg-primary text-primary/g, 'border-border bg-primary text-primary-foreground shadow-[4px_4px_0px_var(--color-border)]');

fs.writeFileSync(p, c);
console.log('Profile fixed');

let ch = 'src/pages/Chatbot.tsx';
let chc = fs.readFileSync(ch, 'utf8');
chc = chc.replace(/bg-primary hover:bg-primary dark:bg-primary dark:hover:bg-primary text-primary dark:text-primary/g, 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[4px_4px_0px_var(--color-border)] border-2 border-border');
chc = chc.replace(/bg-primary hover:bg-primary\/90 text-primary/g, 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[4px_4px_0px_var(--color-border)] border-2 border-border');
fs.writeFileSync(ch, chc);
console.log('Chatbot fixed');
