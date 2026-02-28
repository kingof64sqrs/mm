import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scaleFont, moderateScale, spacing } from '../utils/responsive';
import Sidebar from '../components/Sidebar';
import CommonHeader from '../components/CommonHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.85;

type EmergencyContact = {
  name: string;
  phone: string;
  icon?: string;
};

type ContactCategory = {
  title: string;
  icon: string;
  color: string;
  contacts: EmergencyContact[];
};

const emergencyData: ContactCategory[] = [
  {
    title: 'Gujarati Samaj',
    icon: 'business',
    color: '#8B5CF6',
    contacts: [
      { name: 'Sri Coimbatore Gujarati Samaj', phone: '0422-2393434', icon: 'call' },
      { name: 'Gujarati Samaj Guest House', phone: '9486412014', icon: 'home' },
      { name: 'Kanchan Gujarati Samaj', phone: '8680834716', icon: 'restaurant' },
      { name: 'Gujarati Samaj Hall Booking', phone: '9486256227', icon: 'calendar' },
    ],
  },
  {
    title: 'Blood Bank',
    icon: 'water',
    color: '#EF4444',
    contacts: [
      { name: 'KMCH Blood Bank', phone: '0422-4323800' },
      { name: 'GKNM Hospital Blood Bank', phone: '0422-2220444' },
    ],
  },
  {
    title: 'Eye Donation (24 Hours)',
    icon: 'eye',
    color: '#3B82F6',
    contacts: [
      { name: 'Aravind Eye Hospital', phone: '0422-4360400' },
      { name: 'Shankara Eye Hospital', phone: '0422-2670000' },
    ],
  },
  {
    title: 'Crematorium',
    icon: 'flame',
    color: '#F59E0B',
    contacts: [
      { name: 'Coimbatore Corporation Electric Crematorium', phone: '0422-2302323' },
      { name: 'GKD Charities Crematorium', phone: '0422-2212121' },
      { name: 'Isha Yoga Center Crematorium', phone: '0422-2515700' },
    ],
  },
  {
    title: 'Freezer Box Services',
    icon: 'snow',
    color: '#06B6D4',
    contacts: [
      { name: 'Freezer Service 1', phone: '9842222222' },
      { name: 'Freezer Service 2', phone: '9443033333' },
    ],
  },
  {
    title: 'Emergency Hospitals',
    icon: 'medical',
    color: '#10B981',
    contacts: [
      { name: 'Ganga Hospital', phone: '0422-2485000' },
      { name: 'KMCH Hospital', phone: '0422-4323800' },
      { name: 'GKNM Hospital', phone: '0422-2220444' },
      { name: 'Royal Care Super Speciality Hospital', phone: '0422-4001000' },
      { name: 'KG Hospital', phone: '0422-2212121' },
    ],
  },
];

const EmergencyContactsScreen = ({ navigation }: any) => {
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

  const handleCall = (phoneNumber: string) => {
    const phone = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader
        onMenuPress={toggleSidebar}
        title="Emergency Contacts"
        subtitle="24/7 Emergency Services"
        subtitleIcon="medical"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {emergencyData.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={24} color="#FFF" />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            <View style={styles.contactsList}>
              {category.contacts.map((contact, contactIndex) => (
                <TouchableOpacity
                  key={contactIndex}
                  style={styles.contactItem}
                  onPress={() => handleCall(contact.phone)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactInfo}>
                    {contact.icon && (
                      <View style={styles.contactIconSmall}>
                        <Ionicons name={contact.icon as any} size={16} color="#6B46C1" />
                      </View>
                    )}
                    <View style={styles.contactTextContainer}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                    </View>
                  </View>
                  <View style={styles.callButton}>
                    <Ionicons name="call" size={20} color="#10B981" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footerSpace} />
      </ScrollView>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        sidebarAnim={sidebarAnim}
        overlayAnim={overlayAnim}
        currentScreen="Emergency"
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    borderRadius: moderateScale(20),
    marginBottom: spacing.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryTitle: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  contactsList: {
    gap: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIconSmall: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(10),
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#6B7280',
  },
  callButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSpace: {
    height: spacing.xl,
  },
});

export default EmergencyContactsScreen;
