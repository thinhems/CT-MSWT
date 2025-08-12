import fs from 'fs';

const tableFiles = [
  { 
    file: 'src/components/FloorTable.tsx', 
    dataVar: 'floor',
    handlerFix: 'const handleDropdownAction = (item, floor) => {\n    onActionClick({ action: item.action, floor });\n  };'
  },
  { 
    file: 'src/components/ReportTable.jsx', 
    dataVar: 'report',
    handlerFix: 'const handleDropdownAction = (item, report) => {\n    onActionClick({ action: item.action, report });\n  };'
  },
  { 
    file: 'src/components/TrashBinTable.jsx', 
    dataVar: 'trashBin',
    handlerFix: 'const handleDropdownAction = (item, trashBin) => {\n    onActionClick({ action: item.action, trashBin });\n  };'
  },
  { 
    file: 'src/components/RestroomTable.tsx', 
    dataVar: 'restroom',
    handlerFix: 'const handleDropdownAction = (item, restroom) => {\n    onActionClick({ action: item.action, restroom });\n  };'
  }
];

function fixTableFile(tableInfo) {
  try {
    let content = fs.readFileSync(tableInfo.file, 'utf8');
    
    console.log(`Fixing ${tableInfo.file}...`);
    
    // Fix triggerData from item to correct variable
    content = content.replace('triggerData={item}', `triggerData={${tableInfo.dataVar}}`);
    
    // Find and clean up old code after Dropdown
    const dropdownEndPattern = new RegExp(`triggerData={${tableInfo.dataVar}}`, 'g');
    const matches = [...content.matchAll(dropdownEndPattern)];
    
    if (matches.length > 0) {
      const dropdownEnd = matches[0].index + matches[0][0].length;
      const nextTdEnd = content.indexOf('</td>', dropdownEnd);
      
      if (nextTdEnd > -1) {
        const before = content.substring(0, dropdownEnd);
        const after = content.substring(nextTdEnd);
        content = before + '\n                />\n              ' + after;
      }
    }
    
    // Remove old state and handlers
    content = content.replace(/const \[openDropdown.*?\];/g, '');
    content = content.replace(/const handleActionSelect.*?};/gs, '');
    content = content.replace(/const handleDropdownToggle.*?};/gs, '');
    
    // Fix handleDropdownAction
    content = content.replace(/const handleDropdownAction = \(item, data\) => \{\s*onActionClick\(\{ action: item\.action, \[Object\.keys\(data\)\[0\]\]: data \}\);\s*\};/g, 
      tableInfo.handlerFix);
    
    // Remove click outside dropdown
    content = content.replace(/\s*\/\* Click outside to close dropdown \*\/[\s\S]*?\{openDropdown[\s\S]*?<\/div>\s*\}\)/g, '');
    
    // Clean up extra whitespace
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(tableInfo.file, content);
    console.log(`✅ Fixed ${tableInfo.file}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${tableInfo.file}:`, error.message);
  }
}

// Fix all table files
tableFiles.forEach(fixTableFile);

console.log('\n🎉 All table files have been fixed!');
