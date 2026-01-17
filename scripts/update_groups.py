import json
import re

# Read the raw group data
with open('/home/developer/Documents/mm/data/raw.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Read the existing members data
with open('/home/developer/Documents/mm/data/members.json', 'r', encoding='utf-8') as f:
    members = json.load(f)

# Split by "Group No - " to get each group section
group_sections = re.split(r'Group No - ', content)[1:]  # Skip first empty part

groups = []

for section in group_sections:
    lines = [l.strip() for l in section.split('\n') if l.strip()]
    if not lines:
        continue
    
    # First line is group number
    try:
        group_num = int(lines[0])
    except:
        continue
    
    current_group = {
        'group_number': group_num,
        'captains': [],
        'members': []
    }
    
    in_captains = False
    i = 1
    
    while i < len(lines):
        line = lines[i]
        
        # Check if we're entering captains section
        if 'Captain' in line:
            in_captains = True
            i += 1
            continue
        
        # Check if it's a numbered member (ends captains section)
        if re.match(r'^\d+\.', line):
            in_captains = False
            # Extract member name
            member_name = re.sub(r'^\d+\.\s*', '', line).strip()
            if member_name and member_name not in ['DIL', '']:
                current_group['members'].append(member_name)
            i += 1
            continue
        
        # If in captains section and not a phone number
        if in_captains:
            # Skip phone numbers (10 digits)
            if not re.match(r'^\d{10}', line) and len(line) > 3:
                current_group['captains'].append(line.replace(',', '').strip())
        
        i += 1
    
    if current_group['members'] or current_group['captains']:
        groups.append(current_group)

print(f"\nParsed {len(groups)} groups\n")

# Show first few groups for verification
for i, g in enumerate(groups[:3]):
    print(f"Group {g['group_number']}:")
    print(f"  Captains: {g['captains']}")
    print(f"  Members ({len(g['members'])}): {g['members'][:3]}...")
    print()

# Create a mapping of member names to group info
name_to_group = {}

for group in groups:
    group_num = group['group_number']
    
    # Add captains
    for captain in group['captains']:
        clean_captain = captain.strip()
        name_to_group[clean_captain.lower()] = {
            'groupNumber': group_num,
            'groupName': f"Group {group_num}",
            'isCaptain': True
        }
    
    # Add members
    for member in group['members']:
        clean_member = member.strip()
        if clean_member:
            name_to_group[clean_member.lower()] = {
                'groupNumber': group_num,
                'groupName': f"Group {group_num}",
                'isCaptain': False
            }

# Function to normalize names for matching
def normalize_name(name):
    name = re.sub(r'\s+', ' ', name)
    name = name.replace('.', '').replace(',', '').strip().lower()
    return name

# Function to check if names match
def names_match(name1, name2):
    n1 = normalize_name(name1)
    n2 = normalize_name(name2)
    
    if n1 == n2:
        return True
    
    # Extract core name parts (ignore dots, commas, etc.)
    words1 = [w for w in n1.split() if len(w) > 2]
    words2 = [w for w in n2.split() if len(w) > 2]
    
    # Check if at least 2 significant words match
    if len(words1) >= 2 and len(words2) >= 2:
        common = set(words1) & set(words2)
        if len(common) >= 2:
            return True
    
    return False

# Update members with group information
updated_count = 0
captain_count = 0

for member in members:
    member_name = member['name']
    matched = False
    
    # Try to find a match in the group data
    for group_name, group_info in name_to_group.items():
        if names_match(member_name, group_name):
            member['groupNumber'] = group_info['groupNumber']
            member['groupName'] = group_info['groupName']
            
            if group_info['isCaptain']:
                # Update role to Cooking Captain
                if member['role'] == 'President':
                    member['role'] = 'President, Cooking Captain'
                else:
                    member['role'] = 'Cooking Captain'
                captain_count += 1
            
            updated_count += 1
            matched = True
            break
    
    # If not matched, set default
    if not matched:
        member['groupNumber'] = 0
        member['groupName'] = "Unassigned"

print(f"Updated {updated_count} members with group info")
print(f"Found {captain_count} cooking captains")

# Save updated members data
with open('/home/developer/Documents/mm/data/members.json', 'w', encoding='utf-8') as f:
    json.dump(members, f, indent=2, ensure_ascii=False)

print("Members data updated successfully!")

# Create a summary
group_summary = {}
for member in members:
    group_num = member.get('groupNumber', 0)
    if group_num not in group_summary:
        group_summary[group_num] = {'total': 0, 'captains': 0}
    group_summary[group_num]['total'] += 1
    if 'Cooking Captain' in member['role']:
        group_summary[group_num]['captains'] += 1

print("\nGroup Summary:")
for group_num in sorted(group_summary.keys()):
    if group_num > 0:
        print(f"Group {group_num}: {group_summary[group_num]['total']} members, {group_summary[group_num]['captains']} captains")
    elif group_num == 0:
        print(f"Unassigned: {group_summary[group_num]['total']} members")


# Create a mapping of member names to group info
name_to_group = {}

for group in groups:
    group_num = group['group_number']
    
    # Add captains
    for captain in group['captains']:
        clean_captain = captain.strip()
        name_to_group[clean_captain.lower()] = {
            'groupNumber': group_num,
            'groupName': f"Group {group_num}",
            'isCaptain': True
        }
    
    # Add members
    for member in group['members']:
        clean_member = member.strip()
        if clean_member:
            name_to_group[clean_member.lower()] = {
                'groupNumber': group_num,
                'groupName': f"Group {group_num}",
                'isCaptain': False
            }

# Function to normalize names for matching
def normalize_name(name):
    name = re.sub(r'\s+', ' ', name)
    name = name.replace('.', '').replace(',', '').strip().lower()
    return name

# Function to check if names match
def names_match(name1, name2):
    n1 = normalize_name(name1)
    n2 = normalize_name(name2)
    
    if n1 == n2:
        return True
    
    # Extract core name parts (ignore dots, commas, etc.)
    words1 = [w for w in n1.split() if len(w) > 2]
    words2 = [w for w in n2.split() if len(w) > 2]
    
    # Check if at least 2 significant words match
    if len(words1) >= 2 and len(words2) >= 2:
        common = set(words1) & set(words2)
        if len(common) >= 2:
            return True
    
    return False

# Update members with group information
updated_count = 0
captain_count = 0

for member in members:
    member_name = member['name']
    matched = False
    
    # Try to find a match in the group data
    for group_name, group_info in name_to_group.items():
        if names_match(member_name, group_name):
            member['groupNumber'] = group_info['groupNumber']
            member['groupName'] = group_info['groupName']
            
            if group_info['isCaptain']:
                # Update role to Cooking Captain
                if member['role'] == 'President':
                    member['role'] = 'President, Cooking Captain'
                else:
                    member['role'] = 'Cooking Captain'
                captain_count += 1
            
            updated_count += 1
            matched = True
            break
    
    # If not matched, set default
    if not matched:
        member['groupNumber'] = 0
        member['groupName'] = "Unassigned"

print(f"Updated {updated_count} members with group info")
print(f"Found {captain_count} cooking captains")

# Save updated members data
with open('/home/developer/Documents/mm/data/members.json', 'w', encoding='utf-8') as f:
    json.dump(members, f, indent=2, ensure_ascii=False)

print("Members data updated successfully!")

# Create a summary
group_summary = {}
for member in members:
    group_num = member.get('groupNumber', 0)
    if group_num not in group_summary:
        group_summary[group_num] = {'total': 0, 'captains': 0}
    group_summary[group_num]['total'] += 1
    if 'Cooking Captain' in member['role']:
        group_summary[group_num]['captains'] += 1

print("\nGroup Summary:")
for group_num in sorted(group_summary.keys()):
    if group_num > 0:
        print(f"Group {group_num}: {group_summary[group_num]['total']} members, {group_summary[group_num]['captains']} captains")
    elif group_num == 0:
        print(f"Unassigned: {group_summary[group_num]['total']} members")


# Create a mapping of member names to group info
name_to_group = {}
captain_names = set()

for group in groups:
    group_num = group['group_number']
    
    # Add captains
    for captain in group['captains']:
        clean_captain = captain.replace(',', '').strip()
        captain_names.add(clean_captain.lower())
        name_to_group[clean_captain.lower()] = {
            'groupNumber': group_num,
            'isCaptain': True
        }
    
    # Add members
    for member in group['members']:
        clean_member = member.strip()
        if clean_member and clean_member not in ['DIL', 'DIL']:
            name_to_group[clean_member.lower()] = {
                'groupNumber': group_num,
                'isCaptain': False
            }

# Function to normalize names for matching
def normalize_name(name):
    # Remove extra spaces, dots, and make lowercase
    name = re.sub(r'\s+', ' ', name)
    name = name.replace('.', '').replace(',', '').strip().lower()
    return name

# Function to check if names match
def names_match(name1, name2):
    n1 = normalize_name(name1)
    n2 = normalize_name(name2)
    
    # Exact match
    if n1 == n2:
        return True
    
    # Check if one contains the other (for partial matches)
    if len(n1) > 10 and len(n2) > 10:
        if n1 in n2 or n2 in n1:
            return True
    
    # Check word-by-word match (at least 2 words match)
    words1 = set(n1.split())
    words2 = set(n2.split())
    common = words1 & words2
    if len(common) >= 2:
        return True
    
    return False

# Update members with group information
updated_count = 0
captain_count = 0

for member in members:
    member_name = member['name']
    matched = False
    
    # Try to find a match in the group data
    for group_name, group_info in name_to_group.items():
        if names_match(member_name, group_name):
            member['groupNumber'] = group_info['groupNumber']
            
            if group_info['isCaptain']:
                # Update role to Cooking Captain
                if member['role'] == 'President':
                    member['role'] = 'President, Cooking Captain'
                else:
                    member['role'] = 'Cooking Captain'
                captain_count += 1
            
            updated_count += 1
            matched = True
            break
    
    # If not matched, set default group (or leave without group)
    if not matched:
        member['groupNumber'] = 0  # 0 means no group assigned

print(f"Updated {updated_count} members with group info")
print(f"Found {captain_count} cooking captains")

# Save updated members data
with open('/home/developer/Documents/mm/data/members.json', 'w', encoding='utf-8') as f:
    json.dump(members, f, indent=2, ensure_ascii=False)

print("Members data updated successfully!")

# Create a summary
group_summary = {}
for member in members:
    group_num = member.get('groupNumber', 0)
    if group_num not in group_summary:
        group_summary[group_num] = {'total': 0, 'captains': 0}
    group_summary[group_num]['total'] += 1
    if 'Cooking Captain' in member['role']:
        group_summary[group_num]['captains'] += 1

print("\nGroup Summary:")
for group_num in sorted(group_summary.keys()):
    if group_num > 0:
        print(f"Group {group_num}: {group_summary[group_num]['total']} members, {group_summary[group_num]['captains']} captains")
