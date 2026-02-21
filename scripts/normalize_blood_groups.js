const fs = require('fs');
const path = require('path');

// Read the members data
const membersPath = path.join(__dirname, '..', 'data', 'updated_members.json');
const members = JSON.parse(fs.readFileSync(membersPath, 'utf8'));

// Function to normalize blood group
function normalizeBloodGroup(bloodGroup) {
  if (!bloodGroup || typeof bloodGroup !== 'string') {
    return '';
  }

  // Convert to uppercase and trim
  let normalized = bloodGroup.trim().toUpperCase();
  
  // Remove newlines and extra spaces first
  normalized = normalized.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Remove common prefixes (but keep the blood type part)
  normalized = normalized.replace(/^BLOOD\s*GROUP[-:.\s]*/i, '');
  normalized = normalized.replace(/^BG[-:.\s]*/i, '');
  
  // Handle "POSITIVE" and "NEGATIVE" before other operations
  normalized = normalized.replace(/\s*POSITIVE\s*$/i, '+');
  normalized = normalized.replace(/\s*NEGATIVE\s*$/i, '-');
  normalized = normalized.replace(/\s*POSTIVE\s*$/i, '+'); // Common typo
  
  // Handle variations with 've' or 'VE' - but keep + or -
  // Replace +ve with +, -ve with -, etc.
  normalized = normalized.replace(/([+-])\s*VE\.?$/i, '$1');
  
  // Now remove all spaces
  normalized = normalized.replace(/\s+/g, '');
  
  // Handle number 0 vs letter O
  normalized = normalized.replace(/^0([+-])/, 'O$1');
  
  // Remove leading dots
  normalized = normalized.replace(/^\.+/, '');
  
  // Remove trailing dots and other punctuation
  normalized = normalized.replace(/[.,;:]+$/g, '');
  
  // Handle A1 blood group (A1 is a subtype of A, normalize to A)
  normalized = normalized.replace(/^A1([+-])/, 'A$1');
  
  // Remove any remaining non-standard characters except A, B, O, +, -
  normalized = normalized.replace(/[^ABO+-]/g, '');
  
  // Validate and standardize
  const validBloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  
  // Check if it matches a valid blood group
  if (validBloodGroups.includes(normalized)) {
    return normalized;
  }
  
  // Try to fix common patterns
  if (normalized.includes('AB')) {
    if (normalized.includes('+')) return 'AB+';
    if (normalized.includes('-')) return 'AB-';
  } else if (normalized.includes('A')) {
    if (normalized.includes('+')) return 'A+';
    if (normalized.includes('-')) return 'A-';
  } else if (normalized.includes('B')) {
    if (normalized.includes('+')) return 'B+';
    if (normalized.includes('-')) return 'B-';
  } else if (normalized.includes('O')) {
    if (normalized.includes('+')) return 'O+';
    if (normalized.includes('-')) return 'O-';
  }
  
  // If we can't determine, return empty string
  return '';
}

// Track changes for logging
const changes = [];
let normalizedCount = 0;

// Normalize all blood groups
members.forEach((member, index) => {
  const original = member.bloodGroup;
  const normalized = normalizeBloodGroup(original);
  
  if (original !== normalized) {
    changes.push({
      id: member.id,
      name: member.name,
      original: original,
      normalized: normalized
    });
    normalizedCount++;
  }
  
  member.bloodGroup = normalized;
});

// Write the updated data back
fs.writeFileSync(membersPath, JSON.stringify(members, null, 2), 'utf8');

// Log the changes
console.log(`\n✅ Blood groups normalized successfully!`);
console.log(`Total members processed: ${members.length}`);
console.log(`Blood groups changed: ${normalizedCount}`);

if (changes.length > 0) {
  console.log('\nChanges made:');
  changes.forEach(change => {
    console.log(`  ${change.id}. ${change.name}:`);
    console.log(`     "${change.original}" → "${change.normalized}"`);
  });
}

// Show final distribution
const distribution = {};
members.forEach(member => {
  const bg = member.bloodGroup || 'Not provided';
  distribution[bg] = (distribution[bg] || 0) + 1;
});

console.log('\nFinal blood group distribution:');
Object.keys(distribution)
  .sort()
  .forEach(bg => {
    console.log(`  ${bg.padEnd(15)}: ${distribution[bg]}`);
  });
