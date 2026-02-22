import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scaleFont, moderateScale, spacing, hp } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.85;

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  sidebarAnim: Animated.Value;
  overlayAnim: Animated.Value;
  currentScreen: 'Directory' | 'Committee' | 'Emergency';
  navigation: any;
  viewMode?: 'members' | 'groups';
  onViewModeChange?: (mode: 'members' | 'groups') => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sidebarAnim,
  overlayAnim,
  currentScreen,
  navigation,
  viewMode,
  onViewModeChange,
}) => {
  const handleNavigateToDirectory = (mode: 'members' | 'groups') => {
    onClose();
    setTimeout(() => {
      if (currentScreen === 'Directory' && onViewModeChange) {
        onViewModeChange(mode);
      } else {
        navigation.navigate('Directory', { viewMode: mode });
      }
    }, 300);
  };

  const handleNavigateToCommittee = () => {
    onClose();
    setTimeout(() => {
      navigation.navigate('Committee');
    }, 300);
  };

  const handleNavigateToEmergency = () => {
    onClose();
    setTimeout(() => {
      navigation.navigate('Emergency');
    }, 300);
  };

  return (
    <>
      {isOpen && (
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#8B5CF6', '#6B46C1']}
          style={styles.sidebarHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.sidebarHeaderTop}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.sidebarLogo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={onClose} style={styles.closeSidebarBtn}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <Text style={styles.sidebarSubtitle}>Mahila Mandal Directory</Text>
          <Text style={styles.memorialText}>In Loving Memory of Malthi Kishore Raichura</Text>
        </LinearGradient>

        <View style={styles.sidebarContent}>
          <TouchableOpacity
            style={[
              styles.menuItem,
              currentScreen === 'Directory' && viewMode === 'members' && styles.menuItemActive,
            ]}
            onPress={() => handleNavigateToDirectory('members')}
          >
            <View
              style={[
                styles.menuIconContainer,
                currentScreen === 'Directory' && viewMode === 'members' && styles.menuIconActive,
              ]}
            >
              <Ionicons
                name="people"
                size={22}
                color={
                  currentScreen === 'Directory' && viewMode === 'members' ? '#FFF' : '#6B46C1'
                }
              />
            </View>
            <Text
              style={[
                styles.menuItemText,
                currentScreen === 'Directory' && viewMode === 'members' && styles.menuItemTextActive,
              ]}
            >
              All Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              currentScreen === 'Directory' && viewMode === 'groups' && styles.menuItemActive,
            ]}
            onPress={() => handleNavigateToDirectory('groups')}
          >
            <View
              style={[
                styles.menuIconContainer,
                currentScreen === 'Directory' && viewMode === 'groups' && styles.menuIconActive,
              ]}
            >
              <Ionicons
                name="grid"
                size={22}
                color={currentScreen === 'Directory' && viewMode === 'groups' ? '#FFF' : '#6B46C1'}
              />
            </View>
            <Text
              style={[
                styles.menuItemText,
                currentScreen === 'Directory' && viewMode === 'groups' && styles.menuItemTextActive,
              ]}
            >
              Groups
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, currentScreen === 'Committee' && styles.menuItemActive]}
            onPress={handleNavigateToCommittee}
          >
            <View
              style={[
                styles.menuIconContainer,
                currentScreen === 'Committee' && styles.menuIconActive,
              ]}
            >
              <Ionicons
                name="star"
                size={22}
                color={currentScreen === 'Committee' ? '#FFF' : '#6B46C1'}
              />
            </View>
            <Text
              style={[
                styles.menuItemText,
                currentScreen === 'Committee' && styles.menuItemTextActive,
              ]}
            >
              Committee Info
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, currentScreen === 'Emergency' && styles.menuItemActive]}
            onPress={handleNavigateToEmergency}
          >
            <View
              style={[
                styles.menuIconContainer,
                currentScreen === 'Emergency' && styles.menuIconActive,
              ]}
            >
              <Ionicons
                name="medical"
                size={22}
                color={currentScreen === 'Emergency' ? '#FFF' : '#6B46C1'}
              />
            </View>
            <Text
              style={[
                styles.menuItemText,
                currentScreen === 'Emergency' && styles.menuItemTextActive,
              ]}
            >
              Emergency Contacts
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarFooter}>
          <Text style={styles.kripioText}>Created by company Kripio</Text>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#F8F9FA',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
    borderTopRightRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    overflow: 'hidden',
  },
  sidebarHeader: {
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(5),
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomRightRadius: moderateScale(30),
  },
  sidebarHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarLogo: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  closeSidebarBtn: {
    padding: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(15),
  },
  sidebarTitle: {
    fontSize: scaleFont(28),
    fontWeight: '800',
    color: '#FFF',
    marginTop: spacing.md,
  },
  sidebarSubtitle: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#E9D5FF',
    marginTop: 4,
  },
  memorialText: {
    fontSize: scaleFont(11),
    fontWeight: '400',
    color: '#FDE68A',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  sidebarContent: {
    flex: 1,
    padding: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: moderateScale(16),
  },
  menuItemActive: {
    backgroundColor: '#FFF',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconActive: {
    backgroundColor: '#6B46C1',
  },
  menuItemText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#4B5563',
  },
  menuItemTextActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  sidebarFooter: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  kripioText: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
});

export default Sidebar;
