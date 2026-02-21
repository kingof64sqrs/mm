const fs = require('fs');
const path = require('path');

// Read the members file
const membersPath = path.join(__dirname, '../data/updated_members.json');
const members = JSON.parse(fs.readFileSync(membersPath, 'utf8'));

// Function to convert name to proper case
function toProperCase(name) {
  if (!name) return name;
  
  // First, trim all whitespace and newlines
  name = name.trim().replace(/\s+/g, ' ');
  
  // Convert to proper case: first letter of each word capitalized, rest lowercase
  return name
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      
      // Handle words with dots (like initials or abbreviations)
      if (word.includes('.')) {
        return word.split('.').map(part => {
          if (part.length === 0) return part;
          // If it's a single letter (initial), keep it uppercase
          if (part.length === 1) return part.toUpperCase();
          // Otherwise, proper case
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }).join('.');
      }
      
      // If it's a single letter (initial), keep it uppercase
      if (word.length === 1) return word.toUpperCase();
      
      // Otherwise, proper case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Process all members
let changedCount = 0;
members.forEach((member, index) => {
  const originalName = member.name;
  const cleanedName = toProperCase(originalName);
  
  if (originalName !== cleanedName) {
    console.log(`[${member.id}] "${originalName}" -> "${cleanedName}"`);
    member.name = cleanedName;
    changedCount++;
  }
});

// Write back to file
fs.writeFileSync(membersPath, JSON.stringify(members, null, 2), 'utf8');

console.log(`\nDone! Fixed ${changedCount} names.`);
