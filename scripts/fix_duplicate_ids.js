const fs = require('fs');
const path = require('path');

// Read the members data
const membersPath = path.join(__dirname, '..', 'data', 'updated_members.json');
const members = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));

console.log(`Total members: ${members.length}`);

// Find duplicate IDs
const idCount = {};
members.forEach(member => {
  const id = member.id;
  idCount[id] = (idCount[id] || 0) + 1;
});

const duplicateIds = Object.keys(idCount).filter(id => idCount[id] > 1);
console.log(`Duplicate IDs found: ${duplicateIds.join(', ')}`);

// Find the highest ID
let maxId = Math.max(...members.map(m => parseInt(m.id) || 0));
console.log(`Max ID: ${maxId}`);

// Track which IDs we've seen
const seenIds = new Set();

// Fix duplicate IDs
members.forEach(member => {
  const currentId = member.id;
  
  // If this ID has already been used, assign a new one
  if (seenIds.has(currentId)) {
    maxId++;
    const newId = maxId.toString();
    console.log(`Changing duplicate ID ${currentId} to ${newId} for member: ${member.name}`);
    member.id = newId;
    seenIds.add(newId);
  } else {
    seenIds.add(currentId);
  }
});

// Save the fixed data
fs.writeFileSync(membersPath, JSON.stringify(members, null, 2), 'utf-8');

console.log(`\nFixed! All members now have unique IDs.`);
console.log(`Total members: ${members.length}`);
console.log(`Unique IDs: ${seenIds.size}`);
