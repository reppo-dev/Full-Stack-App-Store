const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app');

const replacements = [
  { regex: /@\/components\/landing\/([^"']+)/g, replacement: '@/features/home/components/$1' },
  { regex: /@\/components\/page\/calendar\/([^"']+)/g, replacement: '@/features/calendar/components/$1' },
  { regex: /@\/app\/\(dashboard\)\/components\/dashboard\/([^"']+)/g, replacement: '@/features/dashboard/components/$1' },
  { regex: /@\/app\/\(dashboard\)\/components\/inbox\/([^"']+)/g, replacement: '@/features/tickets/components/$1' },
  { regex: /@\/app\/\(dashboard\)\/components\/FormUser/g, replacement: '@/features/users/components/EditUserForm' },
  // Handle relative imports by replacing the file name if it's FormUser
  { regex: /(["'])(?:\.\.\/)*components\/FormUser(?:\.tsx)?(["'])/g, replacement: '$1@/features/users/components/EditUserForm$2' },
  { regex: /(["'])(?:\.\.\/)+components\/landing\/([^"']+)(["'])/g, replacement: '$1@/features/home/components/$2$3' },
  { regex: /(["'])(?:\.\.\/)+components\/page\/calendar\/([^"']+)(["'])/g, replacement: '$1@/features/calendar/components/$2$3' },
  { regex: /(["'])(?:\.\.\/)+components\/dashboard\/([^"']+)(["'])/g, replacement: '$1@/features/dashboard/components/$2$3' },
  { regex: /(["'])(?:\.\.\/)+components\/inbox\/([^"']+)(["'])/g, replacement: '$1@/features/tickets/components/$2$3' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updated = false;
      
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          updated = true;
        }
      }
      
      if (updated) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

processDirectory(targetDir);
console.log('Import fixing complete.');
