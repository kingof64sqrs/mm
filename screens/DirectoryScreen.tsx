import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import membersData from '../data/members.json';
import cookingGroupsData from '../data/cookingGroups.json';
import { getImage } from '../utils/imageHelper';

type RootStackParamList = {
  Directory: undefined;
  MemberDetail: { member: Member };
  QRScanner: undefined;
};

type DirectoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Directory'
>;

type Props = {
  navigation: DirectoryScreenNavigationProp;
};

export type Member = {
  id: string;
  name: string;
  role: string;
  photo: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  groupNumber?: number;
  groupName?: string;
};

type Group = {
  id: string;
  name: string;
  captains: Member[];
  members: Member[];
};

const DirectoryScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'groups'>('all');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [members] = useState<Member[]>(membersData);

  // Helper function to normalize names for matching
  const normalizeName = (name: string | undefined | null) => {
    if (!name) return '';
    return name.toLowerCase().replace(/[.,]/g, '').trim();
  };

  // Helper function to find member by name (with fuzzy matching)
  const findMemberByName = (searchName: string | undefined | null): Member | null => {
    if (!searchName) return null;
    const normalized = normalizeName(searchName);
    if (!normalized) return null;
    
    // Try exact match first
    let found = members.find(m => normalizeName(m.name) === normalized);
    if (found) return found;
    
    // Try partial match (at least 2 words match)
    const searchWords = normalized.split(/\s+/).filter(w => w.length > 2);
    found = members.find(m => {
      const memberWords = normalizeName(m.name).split(/\s+/).filter(w => w.length > 2);
      const matches = searchWords.filter(sw => memberWords.some(mw => mw.includes(sw) || sw.includes(mw)));
      return matches.length >= 2;
    });
    
    return found || null;
  };

  const groups: Group[] = React.useMemo(() => {
    const teams: Group[] = [];
    
    cookingGroupsData.forEach((groupData: any) => {
      const { groupNumber } = groupData;
      
      // Find all captains
      const captains: Member[] = [];
      groupData.captains.forEach((captainName: string) => {
        let captain = findMemberByName(captainName);
        
        if (!captain) {
          console.log(`Captain not found: ${captainName}`);
          captain = {
            id: `captain-${groupNumber}-${captainName.replace(/\s+/g, '-')}`,
            name: captainName,
            role: 'Cooking Captain',
            photo: 'ids/default.jpg',
            phone: '',
            email: '',
            address: 'Details not available',
            bloodGroup: '',
          };
        }
        captains.push(captain);
      });
      
      // Find all members in this group (all 10 members)
      const groupMembers: Member[] = [];
      groupData.members.forEach((memberName: string) => {
        const member = findMemberByName(memberName);
        if (member) {
          groupMembers.push(member);
        } else {
          // Create placeholder for missing member
          console.log(`Member not found: ${memberName}`);
          groupMembers.push({
            id: `member-${groupNumber}-${memberName.replace(/\s+/g, '-')}`,
            name: memberName,
            role: 'Member',
            photo: 'ids/default.jpg',
            phone: '',
            email: '',
            address: 'Details not available',
            bloodGroup: '',
          });
        }
      });
      
      teams.push({
        id: `group-${groupData.groupNumber}`,
        name: `Group ${groupData.groupNumber}`,
        captains,
        members: groupMembers,
      });
    });
    
    return teams;
  }, [members]);

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    // Search in name
    const nameMatch = member.name.toLowerCase().includes(query);
    
    // Search in phone number (remove spaces and special characters for better matching)
    const cleanPhone = member.phone.replace(/\s+/g, '');
    const cleanQuery = query.replace(/\s+/g, '');
    const phoneMatch = cleanPhone.includes(cleanQuery);
    
    return nameMatch || phoneMatch;
  });

  const renderMember = ({ item }: { item: Member }) => {
    const scaleAnim = new Animated.Value(1);
    const isPresident = item.role === 'President';

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.memberCard, isPresident && styles.presidentCard]}
          onPress={() => navigation.navigate('MemberDetail', { member: item })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles.photoContainer}>
            <Image source={getImage(item.photo)} style={styles.memberPhoto} />
            <View style={styles.onlineIndicator} />
            {isPresident && (
              <View style={styles.starBadge}>
                <Ionicons name="star" size={14} color="#FFB800" />
              </View>
            )}
          </View>
          <View style={styles.memberInfo}>
            <Text style={[styles.memberName, isPresident && styles.presidentName]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.contactRow}>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={14} color={isPresident ? "#FFB800" : "#6B46C1"} />
                <Text style={styles.contactText}>{item.phone.substring(0, 10)}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.viewButton, isPresident && styles.presidentViewButton]}>
            <Ionicons name="chevron-forward" size={24} color={isPresident ? "#FFB800" : "#6B46C1"} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Directory</Text>
            <View style={styles.memberCount}>
              <Ionicons name="people" size={16} color="#6B46C1" />
              <Text style={styles.subtitle}>{members.length} Members</Text>
            </View>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {/* Download functionality */}}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-download" size={24} color="#6B46C1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('QRScanner')}
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code" size={24} color="#6B46C1" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={22} color="#6B46C1" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'all' ? 'people' : 'people-outline'} 
            size={20} 
            color={activeTab === 'all' ? '#6B46C1' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Members
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'groups' ? 'grid' : 'grid-outline'} 
            size={20} 
            color={activeTab === 'groups' ? '#6B46C1' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            Groups
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'all' ? (
        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={groups}
          renderItem={({ item }) => {
            const isExpanded = expandedGroupId === item.id;
            return (
              <View style={styles.groupCard}>
                {/* Group Header */}
                <View style={styles.groupHeaderTop}>
                  <View style={styles.groupTitleRow}>
                    <View style={styles.groupIconContainer}>
                      <Ionicons name="people" size={18} color="#FFF" />
                    </View>
                    <Text style={styles.groupTitle}>{item.name}</Text>
                    <View style={styles.memberCountBadge}>
                      <Text style={styles.memberCountText}>{item.members.length}</Text>
                    </View>
                  </View>
                </View>

                {/* Captains Section */}
                <View style={styles.captainsSection}>
                  <Text style={styles.captainsSectionTitle}>
                    👑 Captain{item.captains.length > 1 ? 's' : ''}
                  </Text>
                  {item.captains.map((captain, idx) => (
                    <TouchableOpacity
                      key={captain.id}
                      style={styles.captainCard}
                      onPress={() => navigation.navigate('MemberDetail', { member: captain })}
                      activeOpacity={0.7}
                    >
                      <Image source={getImage(captain.photo || 'ids/default.jpg')} style={styles.captainAvatar} />
                      <View style={styles.captainInfo}>
                        <Text style={styles.captainNameText}>{captain.name || 'Unknown'}</Text>
                        <Text style={styles.captainPhoneText}>{captain.phone || 'Not available'}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#999" />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Expand/Collapse Button */}
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setExpandedGroupId(isExpanded ? null : item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.expandButtonText}>
                    {isExpanded ? 'Hide Members' : 'View All Members'}
                  </Text>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6B46C1" 
                  />
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.membersSection}>
                    <View style={styles.membersDivider} />
                    <View style={styles.membersListContainer}>
                      {item.members.map((member, index) => (
                        <TouchableOpacity
                          key={member.id}
                          style={styles.memberItemCard}
                          onPress={() => navigation.navigate('MemberDetail', { member })}
                          activeOpacity={0.7}
                        >
                          <View style={styles.memberIndexBadge}>
                            <Text style={styles.memberIndexText}>{index + 1}</Text>
                          </View>
                          <Image source={getImage(member.photo || 'ids/default.jpg')} style={styles.memberAvatar} />
                          <View style={styles.memberDetails}>
                            <Text style={styles.memberNameText} numberOfLines={1}>{member.name || 'Unknown'}</Text>
                            <Text style={styles.memberPhoneText}>{member.phone || 'Not available'}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color="#BBB" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    backgroundColor: '#F0EBFF',
    padding: 8,
    borderRadius: 15,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    backgroundColor: '#F0EBFF',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  searchBox: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#F0EBFF',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#6B46C1',
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  groupHeaderTop: {
    backgroundColor: '#6B46C1',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  memberCountBadge: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  memberCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  captainsSection: {
    padding: 16,
    backgroundColor: '#FAFBFF',
  },
  captainsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B46C1',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  captainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E4F3',
  },
  captainAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFB800',
    marginRight: 12,
  },
  captainInfo: {
    flex: 1,
  },
  captainNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  captainPhoneText: {
    fontSize: 13,
    color: '#666',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F8F5FF',
    borderTopWidth: 1,
    borderTopColor: '#E8E4F3',
    gap: 6,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B46C1',
  },
  membersSection: {
    backgroundColor: '#FFFFFF',
  },
  membersDivider: {
    height: 1,
    backgroundColor: '#E8E4F3',
  },
  membersListContainer: {
    padding: 12,
  },
  memberItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FAFBFF',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  memberIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  memberPhoneText: {
    fontSize: 13,
    color: '#666',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  photoContainer: {
    position: 'relative',
  },
  memberPhoto: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#F0EBFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  starBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 14,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  contactText: {
    fontSize: 13,
    color: '#666',
  },
  viewButton: {
    backgroundColor: '#F0EBFF',
    padding: 8,
    borderRadius: 10,
  },
  presidentCard: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presidentName: {
    color: '#B8860B',
  },
  presidentViewButton: {
    backgroundColor: '#FFF4DB',
  },
});

export default DirectoryScreen;
