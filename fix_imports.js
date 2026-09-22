const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend');

const replacements = [
  // Components
  { from: /@\/components\/login-form/g, to: '@/features/auth/components/login-form' },
  { from: /@\/components\/signup-form/g, to: '@/features/auth/components/signup-form' },
  { from: /@\/components\/logout/g, to: '@/features/auth/components/logout' },
  { from: /['"]\.\.\/logout['"]/g, to: "'@/features/auth/components/logout'" },
  { from: /['"]\.\/logout['"]/g, to: "'@/features/auth/components/logout'" },
  { from: /@\/components\/header\/UserDropdown/g, to: '@/features/auth/components/UserDropdown' },
  { from: /['"]\.\/UserDropdown['"]/g, to: "'@/features/auth/components/UserDropdown'" },
  { from: /@\/components\/sidebarToggle/g, to: '@/features/dashboard/components/sidebarToggle' },
  { from: /['"]\.\.\/sidebarToggle['"]/g, to: "'@/features/dashboard/components/sidebarToggle'" },
  { from: /@\/components\/appSidebar/g, to: '@/features/dashboard/components/appSidebar' },
  { from: /['"]\.\/components\/HeaderDashboard['"]/g, to: "'@/features/dashboard/components/HeaderDashboard'" },
  { from: /['"]\.\/components\/SidebarDash['"]/g, to: "'@/features/dashboard/components/SidebarDash'" },
  { from: /@\/components\/BannerCarousel/g, to: '@/features/banners/components/BannerCarousel' },
  { from: /['"]\.\.\/components\/product\/banner['"]/g, to: "'@/features/banners/components/DashboardBanner'" },
  { from: /@\/components\/StorefrontProductCard/g, to: '@/features/products/components/StorefrontProductCard' },
  { from: /['"]\.\.\/components\/product\/DashboardProductCard['"]/g, to: "'@/features/products/components/DashboardProductCard'" },
  { from: /@\/components\/button-favorite/g, to: '@/features/favorites/components/button-favorite' },
  { from: /@\/components\/cart\/AddToCartButton/g, to: '@/features/cart/components/AddToCartButton' },
  { from: /['"]\.\.\/cart\/HeaderCartButton['"]/g, to: "'@/features/cart/components/HeaderCartButton'" },

  // Actions / API
  { from: /@\/app\/actions\/auth/g, to: '@/features/auth/api/auth.action' },
  { from: /@\/app\/actions\/GetIdUser/g, to: '@/features/auth/api/GetIdUser' },
  { from: /['"]\.\.\/\.\.\/actions\/GetIdUser['"]/g, to: "'@/features/auth/api/GetIdUser'" },
  { from: /['"]\.\/GetIdUser['"]/g, to: "'@/features/auth/api/GetIdUser'" },
  { from: /@\/app\/actions\/getToken/g, to: '@/features/auth/api/getToken' },
  { from: /['"]\.\.\/actions\/getToken['"]/g, to: "'@/features/auth/api/getToken'" },
  { from: /['"]\.\/getToken['"]/g, to: "'@/features/auth/api/getToken'" },
  { from: /@\/app\/actions\/user\.action/g, to: '@/features/users/api/user.action' },
  { from: /@\/app\/actions\/product\.action/g, to: '@/features/products/api/product.action' },

  // API Clients
  { from: /@\/lib\/api\/dashboard/g, to: '@/features/dashboard/api/dashboard.client' },
  { from: /@\/lib\/api\/tickets/g, to: '@/features/tickets/api/tickets.client' },
  { from: /@\/lib\/api\/banners/g, to: '@/features/banners/api/banners.client' },
  { from: /@\/lib\/api\/orders/g, to: '@/features/orders/api/orders.client' },
  { from: /@\/lib\/api\/products/g, to: '@/features/products/api/products.client' },
  { from: /@\/lib\/api\/favorites/g, to: '@/features/favorites/api/favorites.client' },
  { from: /@\/lib\/api\/auth/g, to: '@/features/auth/api/auth.client' },
  
  // Internal API Client refs
  { from: /['"]\.\/client['"]/g, to: "'@/lib/api/client'" },
  { from: /['"]\.\/products['"]/g, to: "'@/features/products/api/products.client'" }
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        results = results.concat(walkDir(filePath));
      }
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walkDir(directoryPath);

let modifiedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Total files updated: ${modifiedFiles}`);
