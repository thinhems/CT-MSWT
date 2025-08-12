import fs from 'fs';
import path from 'path';

const tableFiles = [
  'src/components/AreaTable.tsx',
  'src/components/FloorTable.tsx', 
  'src/components/RestroomTable.tsx',
  'src/components/ShiftTable.tsx',
  'src/components/TrashBinTable.jsx',
  'src/components/ReportTable.jsx'
];

function updateTableFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Updating ${filePath}...`);
    
    // Add Dropdown import if not exists
    if (!content.includes("import Dropdown from './common/Dropdown'")) {
      content = content.replace(
        /import.*from "react-icons\/hi";/,
        match => match + "\nimport Dropdown from './common/Dropdown';"
      );
    }
    
    // Remove HiOutlineDotsVertical from imports
    content = content.replace(/HiOutlineDotsVertical,?\s?/g, '');
    content = content.replace(/,\s*HiOutlineDotsVertical/g, '');
    content = content.replace(/HiOutlineDotsVertical\s*,/g, '');
    
    // Clean up empty import lines
    content = content.replace(/import\s*{\s*}\s*from\s*"react-icons\/hi";/g, '');
    
    // Remove dropdown state and handlers
    content = content.replace(/const \[openDropdown.*?\];/g, '');
    content = content.replace(/const handleDropdownToggle.*?};/gs, '');
    content = content.replace(/const handleActionSelect.*?};/gs, '');
    
    // Add new handler
    if (!content.includes('handleDropdownAction')) {
      const handlerMatch = content.match(/(const \w+Table.*?=.*?\{[^}]*)(const [^}]*})/s);
      if (handlerMatch) {
        content = content.replace(
          handlerMatch[0],
          handlerMatch[1] + `
  const handleDropdownAction = (item, data) => {
    onActionClick({ action: item.action, [Object.keys(data)[0]]: data });
  };

  ` + handlerMatch[2]
        );
      }
    }
    
    // Replace dropdown button with Dropdown component
    const dropdownButtonRegex = /<button[^>]*onClick.*?handleDropdownToggle.*?<\/button>\s*{\/\*.*?\*\/}\s*\{openDropdown.*?\)\}/gs;
    
    if (dropdownButtonRegex.test(content)) {
      content = content.replace(dropdownButtonRegex, `<Dropdown
                  items={[
                    {
                      action: 'view',
                      label: 'Xem chi tiết',
                      icon: <HiOutlineEye style={{ width: "14px", height: "14px" }} />,
                      color: "#374151"
                    },
                    {
                      action: 'edit',
                      label: 'Chỉnh sửa',
                      icon: <HiOutlinePencil style={{ width: "14px", height: "14px" }} />,
                      color: "#374151"
                    }
                  ]}
                  onItemClick={handleDropdownAction}
                  triggerData={item}
                />`);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Update all table files
tableFiles.forEach(updateTableFile);

console.log('\n🎉 All table files updated with consistent Dropdown component!');
