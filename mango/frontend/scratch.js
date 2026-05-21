const fs = require('fs');
const files = [
  'src/features/manufacturing/views/InventoryView.tsx',
  'src/features/manufacturing/views/DowntimeView.tsx',
  'src/features/manufacturing/views/WorkOrdersView.tsx',
  'src/features/manufacturing/components/WorkOrderForm.tsx'
];
const allKeys = new Set();
files.forEach(f => {
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    const regex = /t\(['"]([^'"]+)['"]\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      allKeys.add(match[1]);
    }
  }
});
console.log(JSON.stringify(Array.from(allKeys), null, 2));
