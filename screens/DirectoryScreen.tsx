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
};

type Group = {
  id: string;
  name: string;
  captain: Member;
  members: Member[];
};

const DirectoryScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'groups'>('all');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [members] = useState<Member[]>(membersData);

  const teamNames = [
    'Alpha Team', 'Beta Team', 'Gamma Team', 'Delta Team', 'Epsilon Team',
    'Zeta Team', 'Eta Team', 'Theta Team', 'Iota Team', 'Kappa Team'
  ];

  const groups: Group[] = React.useMemo(() => {
    const groupSize = Math.ceil(members.length / 10);
    const teams: Group[] = [];
    
    for (let i = 0; i < 10; i++) {
      const startIndex = i * groupSize;
      const endIndex = Math.min(startIndex + groupSize, members.length);
      const teamMembers = members.slice(startIndex, endIndex);
      
      if (teamMembers.length > 0) {
        const captain = teamMembers[0];
        const restMembers = teamMembers.slice(1);
        
        teams.push({
          id: `team-${i + 1}`,
          name: teamNames[i],
          captain,
          members: restMembers,
        });
      }
    }
    
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
                <TouchableOpacity
                  style={styles.groupHeader}
                  onPress={() => setExpandedGroupId(isExpanded ? null : item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.teamInfoSection}>
                    <View style={styles.teamNameContainer}>
                      <Ionicons name="shield" size={20} color="#6B46C1" />
                      <Text style={styles.teamName}>{item.name}</Text>
                    </View>
                    <View style={styles.captainInfoRow}>
                      <Image source={getImage(item.captain.photo)} style={styles.captainPhoto} />
                      <View style={styles.captainDetails}>
                        <Text style={styles.captainLabel}>Captain</Text>
                        <Text style={styles.captainName}>{item.captain.name}</Text>
                        <Text style={styles.captainPhone}>{item.captain.phone}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.groupRightSection}>
                    <View style={styles.groupBadge}>
                      <Text style={styles.groupBadgeText}>{item.members.length + 1}</Text>
                      <Text style={styles.groupBadgeLabel}>Members</Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color="#6B46C1" 
                    />
                  </View>
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.groupMembers}>
                    <View style={styles.membersDivider} />
                    <Text style={styles.membersHeader}>Team Members</Text>
                    {item.members.map((member, index) => (
                      <TouchableOpacity
                        key={member.id}
                        style={styles.groupMemberItem}
                        onPress={() => navigation.navigate('MemberDetail', { member })}
                        activeOpacity={0.7}
                      >
                        <View style={styles.memberNumber}>
                          <Text style={styles.memberNumberText}>{index + 1}</Text>
                        </View>
                        <Image source={getImage(member.photo)} style={styles.groupMemberPhoto} />
                        <View style={styles.groupMemberInfo}>
                          <Text style={styles.groupMemberName} numberOfLines={1}>{member.name}</Text>
                          <Text style={styles.groupMemberPhone}>{member.phone}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#999" />
                      </TouchableOpacity>
                    ))}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  teamInfoSection: {
    flex: 1,
  },
  teamNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B46C1',
  },
  captainInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  captainPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFB800',
  },
  captainDetails: {
    flex: 1,
  },
  captainLabel: {
    fontSize: 11,
    color: '#FFB800',
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  captainName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  captainPhone: {
    fontSize: 13,
    color: '#666',
  },
  groupRightSection: {
    alignItems: 'center',
    gap: 8,
  },
  groupBadge: {
    backgroundColor: '#F0EBFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  groupBadgeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B46C1',
  },
  groupBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B46C1',
    marginTop: 2,
  },
  groupMembers: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  membersDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  membersHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  groupMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
    gap: 12,
  },
  memberNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  groupMemberPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  groupMemberInfo: {
    flex: 1,
  },
  groupMemberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  groupMemberPhone: {
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
