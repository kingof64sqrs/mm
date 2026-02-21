import React, { useState, useRef } from 'react';
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
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import membersData from '../data/updated_members.json';
import cookingGroupsData from '../data/cookingGroups.json';
import { getImage } from '../utils/imageHelper';
import { scaleFont, moderateScale, spacing, wp, hp } from '../utils/responsive';
import Sidebar from '../components/Sidebar';

type RootStackParamList = {
  Directory: { viewMode?: 'members' | 'groups' } | undefined;
  MemberDetail: { member: Member };
  QRScanner: undefined;
};

type DirectoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Directory'
>;

type DirectoryScreenRouteProp = import('@react-navigation/native').RouteProp<
  RootStackParamList,
  'Directory'
>;

type Props = {
  navigation: DirectoryScreenNavigationProp;
  route: DirectoryScreenRouteProp;
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.85;

const DirectoryScreen: React.FC<Props> = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [members] = useState<Member[]>(membersData);
  const [viewMode, setViewMode] = useState<'members' | 'groups'>(route.params?.viewMode || 'members');

  // Handle navigation params to change view mode smoothly
  React.useEffect(() => {
    if (route.params?.viewMode && route.params.viewMode !== viewMode) {
      setViewMode(route.params.viewMode);
    }
  }, [route.params?.viewMode]);

  // Filter state
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | null>(null);

  // Derive unique blood groups
  const bloodGroups = React.useMemo(() => {
    const groups = new Set(members.map(m => m.bloodGroup).filter(Boolean));
    return Array.from(groups).sort();
  }, [members]);

  // Sidebar animation state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      Animated.parallel([
        Animated.timing(sidebarAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsSidebarOpen(false));
    } else {
      setIsSidebarOpen(true);
      Animated.parallel([
        Animated.spring(sidebarAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const normalizeName = (name: string | undefined | null) => {
    if (!name) return '';
    return name.toLowerCase().replace(/[.,]/g, '').trim();
  };

  const findMemberByName = (searchName: string | undefined | null): Member | null => {
    if (!searchName) return null;
    const normalized = normalizeName(searchName);
    if (!normalized) return null;

    let found = members.find(m => normalizeName(m.name) === normalized);
    if (found) return found;

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

      const captains: Member[] = [];
      groupData.captains.forEach((captainName: string) => {
        let captain = findMemberByName(captainName);
        if (!captain) {
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

      const groupMembers: Member[] = [];
      groupData.members.forEach((memberName: string) => {
        const member = findMemberByName(memberName);
        if (member) {
          groupMembers.push(member);
        } else {
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
        captains: captains.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
        members: groupMembers.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      });
    });

    return teams;
  }, [members]);

  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase().trim();
    return groups.filter(group => {
      const groupNameMatch = group.name.toLowerCase().includes(query);
      const captainMatch = group.captains.some(c => (c.name || '').toLowerCase().includes(query));
      const memberMatch = group.members.some(m => (m.name || '').toLowerCase().includes(query));
      return groupNameMatch || captainMatch || memberMatch;
    });
  }, [groups, searchQuery]);

  // Handle auto-expanding the first matching group if searching
  React.useEffect(() => {
    if (viewMode === 'groups' && searchQuery.trim().length > 0 && filteredGroups.length > 0) {
      // If we are searching and there's a result, optionally auto expand the first result
      setExpandedGroupId(filteredGroups[0].id);
    }
  }, [searchQuery, viewMode, filteredGroups]);

  // Helper to highlight text
  const HighlightedText = React.useCallback(({ text, highlight, style, numberOfLines }: any) => {
    if (!text) return null;
    if (!highlight.trim()) {
      return <Text style={style} numberOfLines={numberOfLines}>{text}</Text>;
    }

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {parts.map((part: string, i: number) =>
          part.toLowerCase() === highlight.toLowerCase()
            ? <Text key={i} style={{ backgroundColor: '#FEF08A', color: '#B45309' }}>{part}</Text>
            : part
        )}
      </Text>
    );
  }, []);

  const filteredMembers = React.useMemo(() => {
    return members
      .filter((member) => {
        // Name or Phone search
        const query = searchQuery.toLowerCase().trim();
        let matchesSearch = true;
        if (query) {
          const nameMatch = member.name.toLowerCase().includes(query);
          const cleanPhone = member.phone.replace(/\s+/g, '');
          const cleanQuery = query.replace(/\s+/g, '');
          const phoneMatch = cleanPhone.includes(cleanQuery);
          matchesSearch = nameMatch || phoneMatch;
        }

        // Blood group filter
        let matchesBloodGroup = true;
        if (selectedBloodGroup) {
          matchesBloodGroup = member.bloodGroup === selectedBloodGroup;
        }

        return matchesSearch && matchesBloodGroup;
      })
      .sort((a, b) => {
        // Sorting
        if (sortOrder === 'asc') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
  }, [members, searchQuery, selectedBloodGroup, sortOrder]);

  const renderMember = React.useCallback(({ item }: { item: Member }) => {
    return <MemberCard item={item} navigation={navigation} />;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.hamburgerButton}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={24} color="#6B46C1" />
          </TouchableOpacity>

          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <View>
            <Text style={styles.headerTitle}>
              {viewMode === 'members' ? 'Members' : 'Groups'}
            </Text>
            <View style={styles.memberCount}>
              <Ionicons name={viewMode === 'members' ? "people" : "grid"} size={14} color="#6B46C1" />
              <Text style={[styles.subtitle, { marginLeft: 4 }]}>
                {viewMode === 'members' ? `${filteredMembers.length} Members` : `${groups.length} Groups`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerButtons}>
          {viewMode === 'members' && (
            <TouchableOpacity
              style={[styles.iconButton, { marginRight: spacing.sm }]}
              onPress={() => setIsFilterModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="filter"
                size={22}
                color={(sortOrder !== 'asc' || selectedBloodGroup) ? '#FFF' : '#6B46C1'}
              />
              {(sortOrder !== 'asc' || selectedBloodGroup) && (
                <View style={styles.filterActiveDot} />
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('QRScanner')}
            activeOpacity={0.7}
          >
            <Ionicons name="qr-code" size={22} color="#6B46C1" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={22} color="#6B46C1" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={viewMode === 'members' ? "Search members..." : "Search groups..."}
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

      {viewMode === 'members' ? (
        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={5}
          renderItem={({ item }) => {
            const isExpanded = expandedGroupId === item.id;
            return (
              <View style={styles.groupCard}>
                <TouchableOpacity
                  style={styles.groupHeaderTop}
                  onPress={() => setExpandedGroupId(isExpanded ? null : item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupTitleRow}>
                    <View style={styles.groupIconContainer}>
                      <Ionicons name="grid" size={18} color="#6B46C1" />
                    </View>
                    <Text style={styles.groupTitleText}>{item.name}</Text>
                    <View style={styles.memberCountBadge}>
                      <Text style={styles.memberCountText}>{item.members.length} Members</Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#6B46C1"
                    />
                  </View>
                </TouchableOpacity>

                {/* Captains always visible outside the expanded section */}
                {item.captains.length > 0 && (
                  <View style={styles.captainsSectionAlwaysVisible}>
                    <Text style={styles.captainsSectionTitle}>
                      👑 Captain{item.captains.length > 1 ? 's' : ''}
                    </Text>
                    {item.captains.map((captain) => (
                      <TouchableOpacity
                        key={captain.id}
                        style={styles.captainCardAlwaysVisible}
                        onPress={() => navigation.navigate('MemberDetail', { member: captain })}
                      >
                        <Image source={getImage(captain.photo || 'ids/default.jpg')} style={styles.captainAvatarSmall} />
                        <View style={styles.captainInfo}>
                          <HighlightedText
                            text={captain.name || 'Unknown'}
                            highlight={searchQuery}
                            style={styles.captainNameTextSmall}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {isExpanded && (
                  <View style={styles.membersSection}>
                    <View style={styles.membersListContainer}>
                      {item.members.map((member, index) => (
                        <TouchableOpacity
                          key={member.id}
                          style={styles.memberItemCard}
                          onPress={() => navigation.navigate('MemberDetail', { member })}
                        >
                          <View style={styles.memberIndexBadge}>
                            <Text style={styles.memberIndexText}>{index + 1}</Text>
                          </View>
                          <Image source={getImage(member.photo || 'ids/default.jpg')} style={styles.memberAvatarSmall} />
                          <HighlightedText
                            text={member.name || 'Unknown'}
                            highlight={searchQuery}
                            style={styles.memberNameTextSmall}
                            numberOfLines={1}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        sidebarAnim={sidebarAnim}
        overlayAnim={overlayAnim}
        currentScreen="Directory"
        navigation={navigation}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFilterModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>Sort By Name</Text>
            <View style={styles.sortOptionsRow}>
              <TouchableOpacity
                style={[styles.sortButton, sortOrder === 'asc' && styles.sortButtonActive]}
                onPress={() => setSortOrder('asc')}
              >
                <Text style={[styles.sortButtonText, sortOrder === 'asc' && styles.sortButtonTextActive]}>A - Z</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortOrder === 'desc' && styles.sortButtonActive]}
                onPress={() => setSortOrder('desc')}
              >
                <Text style={[styles.sortButtonText, sortOrder === 'desc' && styles.sortButtonTextActive]}>Z - A</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>Blood Group</Text>
            <ScrollView style={styles.bloodGroupContainer} horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.bloodGroupBadge, selectedBloodGroup === null && styles.bloodGroupBadgeActive]}
                onPress={() => setSelectedBloodGroup(null)}
              >
                <Text style={[styles.bloodGroupText, selectedBloodGroup === null && styles.bloodGroupTextActive]}>All</Text>
              </TouchableOpacity>
              {bloodGroups.map(bg => (
                <TouchableOpacity
                  key={bg}
                  style={[styles.bloodGroupBadge, selectedBloodGroup === bg && styles.bloodGroupBadgeActive]}
                  onPress={() => setSelectedBloodGroup(bg)}
                >
                  <Text style={[styles.bloodGroupText, selectedBloodGroup === bg && styles.bloodGroupTextActive]}>{bg}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.applyFilterButton}
              onPress={() => setIsFilterModalVisible(false)}
            >
              <Text style={styles.applyFilterText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hamburgerButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
    backgroundColor: '#F0EBFF',
    borderRadius: moderateScale(8),
  },
  logoImage: {
    width: moderateScale(50),
    height: moderateScale(50),
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: scaleFont(22),
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontSize: scaleFont(13),
    color: '#666',
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: '#F0EBFF',
    padding: spacing.sm,
    borderRadius: moderateScale(12),
    position: 'relative',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: moderateScale(16),
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: spacing.md,
    marginLeft: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: scaleFont(16),
    color: '#333',
    minHeight: moderateScale(40),
  },
  listContainer: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.05)',
  },
  photoContainer: {
    position: 'relative',
  },
  memberPhoto: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(18),
    backgroundColor: '#F0EBFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  starBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#FFF',
    borderRadius: moderateScale(12),
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberName: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  contactText: {
    fontSize: scaleFont(12),
    color: '#4B5563',
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: '#F0EBFF',
    padding: spacing.sm,
    borderRadius: moderateScale(12),
    marginLeft: spacing.sm,
  },
  presidentCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
  },
  presidentName: {
    color: '#92400E',
  },
  presidentViewButton: {
    backgroundColor: '#FFB800',
  },
  groupCard: {
    backgroundColor: '#FFF',
    borderRadius: moderateScale(16),
    marginBottom: spacing.md,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  groupHeaderTop: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFF',
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  groupIconContainer: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(10),
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupTitleText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  memberCountBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  memberCountText: {
    fontSize: scaleFont(12),
    fontWeight: '700',
    color: '#4B5563',
  },
  captainsSectionAlwaysVisible: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  captainCardAlwaysVisible: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: spacing.xs,
    borderRadius: moderateScale(10),
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  captainAvatarSmall: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    marginRight: spacing.sm,
  },
  captainNameTextSmall: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#92400E',
  },
  membersSection: {
    backgroundColor: '#FAFBFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  captainsSection: {

    padding: spacing.md,
  },
  captainsSectionTitle: {
    fontSize: scaleFont(12),
    fontWeight: '700',
    color: '#6B46C1',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  captainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: spacing.sm,
    borderRadius: moderateScale(12),
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E8E4F3',
  },
  captainAvatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    marginRight: spacing.sm,
  },
  captainInfo: {
    flex: 1,
  },
  captainNameText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  membersDivider: {
    height: 1,
    backgroundColor: '#E8E4F3',
    marginHorizontal: spacing.md,
  },
  membersListContainer: {
    padding: spacing.md,
  },
  memberItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: moderateScale(10),
    marginBottom: spacing.xs,
  },
  memberAvatarSmall: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    marginRight: spacing.sm,
  },
  memberIndexBadge: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  memberIndexText: {
    fontSize: scaleFont(11),
    fontWeight: '700',
    color: '#4B5563',
  },
  memberNameTextSmall: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl * 1.5 : spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  filterSectionTitle: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#6B46C1',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sortOptionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sortButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: moderateScale(10),
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortButtonActive: {
    backgroundColor: '#F0EBFF',
    borderColor: '#6B46C1',
  },
  sortButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#4B5563',
  },
  sortButtonTextActive: {
    color: '#6B46C1',
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  bloodGroupBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: moderateScale(16),
    backgroundColor: '#F3F4F6',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bloodGroupBadgeActive: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  bloodGroupText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#4B5563',
  },
  bloodGroupTextActive: {
    color: '#FFF',
  },
  applyFilterButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: spacing.md,
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginTop: spacing.md,
  },
  applyFilterText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#FFF',
  },
});

// Create a component for the member card to use hooks safely inside FlatList
const MemberCard = React.memo(({ item, navigation }: { item: Member, navigation: any }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isPresident = item.role === 'President';

  const handlePressIn = React.useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = React.useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

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
              <Text style={[styles.contactText, { marginLeft: 4 }]}>{item.phone.substring(0, 10)}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.viewButton, isPresident && styles.presidentViewButton]}>
          <Ionicons name="chevron-forward" size={20} color={isPresident ? "#FFF" : "#6B46C1"} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default DirectoryScreen;
