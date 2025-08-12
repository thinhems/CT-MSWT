import fs from 'fs';

let content = fs.readFileSync('src/components/AreaTable.tsx', 'utf8');

// Find the position after Dropdown component and remove everything until </td>
const dropdownEnd = content.indexOf('triggerData={area}') + 'triggerData={area}'.length;
const nextTdEnd = content.indexOf('</td>', dropdownEnd);

if (dropdownEnd > -1 && nextTdEnd > -1) {
  const before = content.substring(0, dropdownEnd);
  const after = content.substring(nextTdEnd);
  
  content = before + '\n                />\n              ' + after;
  
  fs.writeFileSync('src/components/AreaTable.tsx', content);
  console.log('✅ Fixed AreaTable.tsx');
} else {
  console.log('❌ Could not find pattern in AreaTable.tsx');
}
