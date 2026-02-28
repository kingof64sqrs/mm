import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../App';
import { scaleFont, moderateScale, spacing } from '../utils/responsive';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Projects'>;
};

const projects = [
  {
    id: 1,
    title: 'Roti, Sabji & Cloth Donation',
    subtitle: 'Every Month',
    description:
      'Monthly distribution of freshly prepared roti, sabji, and clothing to underprivileged families and individuals in need across Coimbatore.',
    icon: 'restaurant' as const,
    colors: ['#F97316', '#EA580C'] as [string, string],
    emoji: '🍱',
  },
  {
    id: 2,
    title: 'Summer Seva – Mango Donation',
    subtitle: 'Annual Summer Project',
    description:
      'Spreading sweetness during the summer season by distributing mangoes to the needy, the elderly, and underprivileged communities.',
    icon: 'sunny' as const,
    colors: ['#EAB308', '#CA8A04'] as [string, string],
    emoji: '🥭',
  },
  {
    id: 3,
    title: 'Diwali Kit for Needy People',
    subtitle: 'Festive Season Initiative',
    description:
      'Bringing joy and light to those less fortunate by distributing Diwali kits containing sweets, snacks, diyas, and essential items during the festival season.',
    icon: 'flame' as const,
    colors: ['#DC2626', '#B91C1C'] as [string, string],
    emoji: '🪔',
  },
  {
    id: 4,
    title: 'Medical & Education Help',
    subtitle: 'For Needy People',
    description:
      'Providing financial assistance and support for medical treatment and educational needs of underprivileged individuals and families, ensuring access to better healthcare and learning.',
    icon: 'medkit' as const,
    colors: ['#16A34A', '#15803D'] as [string, string],
    emoji: '🏥',
  },
  {
    id: 5,
    title: 'Women Empower',
    subtitle: 'Empowering & Inspiring Women',
    description:
      'Organising workshops, seminars, and skill-development programmes to empower women with knowledge, confidence, and the tools to achieve financial and personal independence.',
    icon: 'woman' as const,
    colors: ['#DB2777', '#BE185D'] as [string, string],
    emoji: '💪',
  },
  {
    id: 6,
    title: 'MM Expo',
    subtitle: 'Annual Exhibition & Showcase',
    description:
      'A grand annual expo celebrating the talents, crafts, and entrepreneurial spirit of Mahila Mandal members — a platform for women to showcase their creativity and products.',
    icon: 'storefront' as const,
    colors: ['#7C3AED', '#6D28D9'] as [string, string],
    emoji: '🎪',
  },
];

const ProjectsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.headerTitle}>Our Projects</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <LinearGradient
          colors={['#8B5CF6', '#6B46C1', '#4C1D95']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Ionicons name="heart-circle" size={44} color="#FFE4B5" />
          <Text style={styles.bannerTitle}>Projects of Mahila Mandal</Text>
          <Text style={styles.bannerSubtitle}>Serving the Community with Love & Care</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{projects.length} Active Projects</Text>
          </View>
        </LinearGradient>

        {/* Project Cards */}
        <View style={styles.cardsContainer}>
          {projects.map((project) => (
            <View key={project.id} style={styles.card}>
              <LinearGradient
                colors={project.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardHeader}
              >
                <View style={styles.cardIconCircle}>
                  <Text style={styles.cardEmoji}>{project.emoji}</Text>
                </View>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.cardTitle}>{project.title}</Text>
                  <Text style={styles.cardSubtitle}>{project.subtitle}</Text>
                </View>
              </LinearGradient>
              <View style={styles.cardBody}>
                <Text style={styles.cardDescription}>{project.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer note */}
        <View style={styles.footerNote}>
          <Ionicons name="ribbon" size={18} color="#8B5CF6" />
          <Text style={styles.footerNoteText}>
            Together we serve · Together we grow
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9D8FD',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: moderateScale(36),
    height: moderateScale(36),
  },
  headerTitle: {
    fontSize: scaleFont(17),
    fontWeight: '700',
    color: '#4C1D95',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.xs,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  banner: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  bannerTitle: {
    fontSize: scaleFont(20),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bannerSubtitle: {
    fontSize: scaleFont(13),
    color: '#DDD6FE',
    textAlign: 'center',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(20),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  countText: {
    color: '#FFE4B5',
    fontSize: scaleFont(12),
    fontWeight: '600',
  },
  cardsContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    borderRadius: moderateScale(16),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardIconCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: scaleFont(24),
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: scaleFont(11),
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  cardBody: {
    padding: spacing.md,
  },
  cardDescription: {
    fontSize: scaleFont(13),
    color: '#4B5563',
    lineHeight: scaleFont(20),
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  footerNoteText: {
    fontSize: scaleFont(13),
    color: '#8B5CF6',
    fontWeight: '600',
  },
});

export default ProjectsScreen;
