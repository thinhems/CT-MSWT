import fs from 'fs';

let content = fs.readFileSync('src/components/ShiftTable.tsx', 'utf8');

// Find the position after triggerData={shift} and remove everything until </td>
const dropdownEnd = content.indexOf('triggerData={shift}') + 'triggerData={shift}'.length;
const nextTdEnd = content.indexOf('</td>', dropdownEnd);

if (dropdownEnd > -1 && nextTdEnd > -1) {
  const before = content.substring(0, dropdownEnd);
  const after = content.substring(nextTdEnd);
  
  content = before + '\n                />\n              ' + after;
  
  // Also remove old state and handlers
  content = content.replace(/const \[openDropdown.*?\];/g, '');
  content = content.replace(/const handleActionSelect.*?};/gs, '');
  content = content.replace(/const handleDropdownToggle.*?};/gs, '');
  
  // Fix handleDropdownAction
  content = content.replace('const handleDropdownAction = (item, data) => {\n    onActionClick({ action: item.action, [Object.keys(data)[0]]: data });\n  };', 
    'const handleDropdownAction = (item, shift) => {\n    onActionClick({ action: item.action, shift });\n  };');
  
  // Remove click outside dropdown
  content = content.replace(/\/\* Click outside to close dropdown \*\/\s*\{openDropdown.*?\}\s*<\/div>/gs, '');
  
  fs.writeFileSync('src/components/ShiftTable.tsx', content);
  console.log('✅ Fixed ShiftTable.tsx');
} else {
  console.log('❌ Could not find pattern in ShiftTable.tsx');
}
