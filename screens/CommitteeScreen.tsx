import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Member } from '../App';
import membersData from '../data/updated_members.json';
import { scaleFont, moderateScale, spacing } from '../utils/responsive';
import { getImage } from '../utils/imageHelper';
import Sidebar from '../components/Sidebar';
import CommonHeader from '../components/CommonHeader';

type CommitteeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Committee'>;

type Props = {
    navigation: CommitteeScreenNavigationProp;
};

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.85;

export default function CommitteeScreen({ navigation }: Props) {
    // Sidebar animation state
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const sidebarAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
    const overlayAnim = React.useRef(new Animated.Value(0)).current;

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
    
    // Define the exact role hierarchy and order we want to display
    const roleGroups = [
        { title: 'President', roleMatch: ['President'] },
        { title: 'Vice Presidents', roleMatch: ['Vice President'] },
        { title: 'Secretaries', roleMatch: ['Secretary', 'Joint Secretary'] },
        { title: 'Treasurers', roleMatch: ['Treasurer', 'Joint Treasurer'] },
        { title: 'Āadhar Stambh', roleMatch: ['Āadhar Stambh'] },
        { title: 'Committee Members', roleMatch: ['Committee Member'] },
    ];

    const groupedMembers = React.useMemo(() => {
        return roleGroups.map(group => {
            const filtered = membersData.filter(member =>
                group.roleMatch.some(role => (member.role || '').includes(role))
            );
            return {
                ...group,
                data: filtered.sort((a, b) => a.name.localeCompare(b.name)),
            };
        }).filter(group => group.data.length > 0); // Only return groups with members
    }, []);

    const renderMember = React.useCallback(({ item }: { item: Member }) => {
        return (
            <TouchableOpacity
                style={styles.memberCard}
                onPress={() => navigation.navigate('MemberDetail', { member: item as any })}
            >
                <Image source={getImage(item.photo || 'ids/default.jpg')} style={styles.avatar} />
                <View style={styles.memberInfo}>
                    <Text style={styles.memberName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText} numberOfLines={1}>{item.role}</Text>
                    </View>
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
            </TouchableOpacity>
        );
    }, [navigation]);

    const renderGroup = React.useCallback(({ item }: { item: typeof groupedMembers[0] }) => {
        return (
            <View style={styles.groupContainer}>
                <View style={styles.groupHeader}>
                    <View style={styles.groupTitleLine} />
                    <Text style={styles.groupTitle}>{item.title}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.data.length}</Text>
                    </View>
                    <View style={styles.groupTitleLine} />
                </View>
                {/* Use a horizontal scroll for presidents or a grid view to make it look distinct */}
                <View style={styles.membersGrid}>
                    {item.data.map((member) => (
                        <View key={member.id} style={styles.gridItemWrapper}>
                            {renderMember({ item: member as any })}
                        </View>
                    ))}
                </View>
            </View>
        );
    }, [renderMember]);

    return (
        <SafeAreaView style={styles.container}>
            <CommonHeader
                onMenuPress={toggleSidebar}
                title="Team EKTA (2023-2026)"
                subtitle="Leadership Team"
                subtitleIcon="star"
            />

            <FlatList
                data={groupedMembers}
                renderItem={renderGroup}
                keyExtractor={(item) => item.title}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                windowSize={5}
                initialNumToRender={3}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={toggleSidebar}
                sidebarAnim={sidebarAnim}
                overlayAnim={overlayAnim}
                currentScreen="Committee"
                navigation={navigation}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F9',
    },
    listContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl * 2,
    },
    groupContainer: {
        marginBottom: spacing.xxl,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    groupTitleLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    groupTitle: {
        fontSize: scaleFont(20),
        fontWeight: '900',
        color: '#1A1A1A',
        marginHorizontal: spacing.md,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    badge: {
        backgroundColor: '#6B46C1',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: moderateScale(12),
        marginRight: spacing.md,
    },
    badgeText: {
        fontSize: scaleFont(12),
        fontWeight: '700',
        color: '#FFF',
    },
    membersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItemWrapper: {
        width: '48%', // Show 2 per row
        marginBottom: spacing.md,
        aspectRatio: 0.85, // Ensures consistent height based on width
    },
    memberCard: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: spacing.md,
        borderRadius: moderateScale(20),
        shadowColor: '#6B46C1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        borderTopWidth: 4,
        borderTopColor: '#6B46C1',
        justifyContent: 'center',
    },
    avatar: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        borderWidth: 3,
        borderColor: '#F0EBFF',
        marginBottom: spacing.sm,
    },
    memberInfo: {
        alignItems: 'center',
        width: '100%',
        flex: 1,
        justifyContent: 'center',
    },
    memberName: {
        fontSize: scaleFont(15),
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 6,
        textAlign: 'center',
        minHeight: scaleFont(15) * 2.2, // Reserve space for 2 lines
    },
    roleBadge: {
        backgroundColor: '#F0EBFF',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: moderateScale(8),
        borderWidth: 1,
        minHeight: moderateScale(28),
        justifyContent: 'center',
        borderColor: '#DDD6FE',
        width: '100%',
        alignItems: 'center',
    },
    roleText: {
        fontSize: scaleFont(11),
        fontWeight: '700',
        color: '#6B46C1',
        textAlign: 'center',
    },
    iconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
