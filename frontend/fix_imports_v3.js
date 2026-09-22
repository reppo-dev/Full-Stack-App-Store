const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app');
const featuresDir = path.join(__dirname, 'features');

const replacements = [
  // Layout components
  { regex: /@\/features\/dashboard\/components\/HeaderDashboard/g, replacement: '@/features/dashboard/components/layout/HeaderDashboard' },
  { regex: /@\/features\/dashboard\/components\/SidebarDash/g, replacement: '@/features/dashboard/components/layout/SidebarDash' },
  { regex: /@\/features\/dashboard\/components\/appSidebar/g, replacement: '@/features/dashboard/components/layout/appSidebar' },
  { regex: /@\/features\/dashboard\/components\/sidebarToggle/g, replacement: '@/features/dashboard/components/layout/sidebarToggle' },
  
  // Main components
  { regex: /@\/features\/dashboard\/components\/KPICards/g, replacement: '@/features/dashboard/components/main/KPICards' },
  { regex: /@\/features\/dashboard\/components\/OrderStatusPieChart/g, replacement: '@/features/dashboard/components/main/OrderStatusPieChart' },
  { regex: /@\/features\/dashboard\/components\/RecentActivityTables/g, replacement: '@/features/dashboard/components/main/RecentActivityTables' },
  { regex: /@\/features\/dashboard\/components\/RevenueAnalyticsChart/g, replacement: '@/features/dashboard/components/main/RevenueAnalyticsChart' },
  { regex: /@\/features\/dashboard\/components\/TopCategoriesBarChart/g, replacement: '@/features/dashboard/components/main/TopCategoriesBarChart' },

  // Users components
  { regex: /@\/features\/dashboard\/components\/Users/g, replacement: '@/features/dashboard/components/users/Users' },
  { regex: /@\/features\/dashboard\/components\/tableUser/g, replacement: '@/features/dashboard/components/users/tableUser' },

  // Product component
  { regex: /@\/features\/dashboard\/components\/ProductDetails/g, replacement: '@/features/dashboard/components/product/ProductDetails' },
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
processDirectory(featuresDir); // also process features as they might import each other
console.log('Import fixing complete.');
