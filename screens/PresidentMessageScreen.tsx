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
  navigation: NativeStackNavigationProp<RootStackParamList, 'PresidentMessage'>;
};

const PresidentMessageScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.headerTitle}>President's Message</Text>
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
          <Ionicons name="ribbon" size={40} color="#FFE4B5" />
          <Text style={styles.bannerTitle}>Message from the President</Text>
          <Text style={styles.bannerSubtitle}>Mahila Mandal · 2023–2026</Text>
        </LinearGradient>

        {/* Greeting */}
        <View style={styles.greetingCard}>
          <Text style={styles.greeting}>🙏🏻 Jai Shree Krishna</Text>
          <Text style={styles.greeting}>🙏🏻 Jai Jinendra</Text>
        </View>

        {/* Message Card */}
        <View style={styles.messageCard}>
          <Text style={styles.salutation}>Dear Members,</Text>

          <Text style={styles.paragraph}>
            It gives me immense pleasure and pride to launch our Mahila Mandal's first-ever{' '}
            <Text style={styles.highlight}>Digital Directory</Text>.
          </Text>

          <Text style={styles.paragraph}>
            As we move forward in an increasingly digital world, it is essential that our Mahila
            Mandal also evolves with time. This directory is not merely a compilation of contact
            details — it is a{' '}
            <Text style={styles.highlight}>digital bridge that connects us beyond boundaries</Text>,
            strengthens our sisterhood, and nurtures a deeper sense of unity within our community.
          </Text>

          <View style={styles.visionBadge}>
            <Ionicons name="bulb-outline" size={20} color="#6B46C1" />
            <Text style={styles.visionText}>"Empowerment through Connectivity"</Text>
          </View>

          <Text style={styles.paragraph}>
            Through this platform, we can showcase our talents, promote and support women-led
            businesses within our Mandal, and access important information instantly and efficiently.
            I encourage every member to explore the directory and actively use this platform to stay
            connected and support one another.
          </Text>

          <Text style={styles.paragraph}>
            My heartfelt gratitude to the{' '}
            <Text style={styles.highlight}>IT &amp; AI team</Text> and all those who worked
            tirelessly behind the scenes to turn this vision into reality. Your dedication and
            efforts are deeply appreciated.
          </Text>

          <Text style={styles.paragraph}>
            Let us continue this journey together —{' '}
            <Text style={styles.highlight}>connected, empowered, and stronger than ever</Text>.
          </Text>
        </View>

        {/* Signature Card */}
        <View style={styles.signatureCard}>
          <View style={styles.signatureDivider} />
          <Text style={styles.regards}>Warm regards,</Text>
          <Text style={styles.presidentName}>Harshidaa Dhiresh Raichura</Text>
          <Text style={styles.presidentTitle}>President</Text>
          <Text style={styles.presidentOrg}>Mahila Mandal</Text>
          <View style={styles.termBadge}>
            <Ionicons name="calendar-outline" size={14} color="#6B46C1" />
            <Text style={styles.termText}>2023 – 2026</Text>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  logo: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
  },
  headerTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  banner: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  bannerTitle: {
    fontSize: scaleFont(22),
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: spacing.sm,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontSize: scaleFont(13),
    color: '#E9D5FF',
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  greetingCard: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    borderRadius: moderateScale(12),
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  greeting: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#4C1D95',
    textAlign: 'center',
    marginVertical: 2,
  },
  messageCard: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    borderRadius: moderateScale(16),
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  salutation: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#333',
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: scaleFont(15),
    color: '#444',
    lineHeight: scaleFont(24),
    marginBottom: spacing.md,
    textAlign: 'justify',
  },
  highlight: {
    color: '#6B46C1',
    fontWeight: '700',
  },
  visionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: moderateScale(10),
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#6B46C1',
  },
  visionText: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#4C1D95',
    marginLeft: spacing.sm,
    fontStyle: 'italic',
    flex: 1,
  },
  signatureCard: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    borderRadius: moderateScale(16),
    padding: spacing.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  signatureDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#FFB800',
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  regards: {
    fontSize: scaleFont(14),
    color: '#666',
    marginBottom: spacing.xs,
  },
  presidentName: {
    fontSize: scaleFont(20),
    fontWeight: '800',
    color: '#4C1D95',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  presidentTitle: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: '#6B46C1',
  },
  presidentOrg: {
    fontSize: scaleFont(14),
    color: '#666',
    marginTop: 2,
  },
  termBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: moderateScale(20),
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  termText: {
    fontSize: scaleFont(13),
    color: '#6B46C1',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default PresidentMessageScreen;
