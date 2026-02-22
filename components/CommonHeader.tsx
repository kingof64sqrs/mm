import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFont, moderateScale, spacing } from '../utils/responsive';

type CommonHeaderProps = {
  onMenuPress: () => void;
  title: string;
  subtitle?: string;
  subtitleIcon?: keyof typeof Ionicons.glyphMap;
  subtitleColor?: string;
  rightButtons?: React.ReactNode;
};

const CommonHeader: React.FC<CommonHeaderProps> = ({
  onMenuPress,
  title,
  subtitle,
  subtitleIcon,
  subtitleColor,
  rightButtons,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={onMenuPress}
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
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && (
            <View style={styles.subtitleContainer}>
              {subtitleIcon && (
                <Ionicons name={subtitleIcon} size={14} color="#6B46C1" />
              )}
              <Text style={[styles.subtitle, subtitleColor && { color: subtitleColor }]}>
                {subtitle}
              </Text>
            </View>
          )}
        </View>
      </View>

      {rightButtons && <View style={styles.headerButtons}>{rightButtons}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.md : spacing.xl,
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
    flex: 1,
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
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontSize: scaleFont(13),
    color: '#666',
    fontWeight: '600',
    marginLeft: 4,
  },
  headerButtons: {
    flexDirection: 'row',
  },
});

export default CommonHeader;
