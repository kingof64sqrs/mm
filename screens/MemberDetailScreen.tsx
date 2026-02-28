import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import { getImage } from '../utils/imageHelper';
import { scaleFont, moderateScale, spacing, wp, hp } from '../utils/responsive';
import { RootStackParamList, Member } from '../App';

type MemberDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MemberDetail'
>;

type MemberDetailScreenRouteProp = RouteProp<RootStackParamList, 'MemberDetail'>;

type Props = {
  navigation: MemberDetailScreenNavigationProp;
  route: MemberDetailScreenRouteProp;
};

const MemberDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { member } = route.params;
  const qrCodeRef = useRef<ViewShot>(null);

  // Check if this is a placeholder captain (details not available)
  const isPlaceholder = member.address === 'Details not available';

  const handleCall = async () => {
    if (isPlaceholder || !member.phone) {
      Alert.alert('Not Available', 'Phone number not available for this member');
      return;
    }
    
    const phoneNumber = member.phone.replace(/\s/g, '');
    const url = `tel:${phoneNumber}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone call not supported on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to make call');
    }
  };

  const handleEmail = async () => {
    if (isPlaceholder || !member.email) {
      Alert.alert('Not Available', 'Email address not available for this member');
      return;
    }
    
    const url = `mailto:${member.email}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Email not supported on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open email');
    }
  };

  const handleWhatsApp = async () => {
    if (isPlaceholder || !member.phone) {
      Alert.alert('Not Available', 'Phone number not available for this member');
      return;
    }
    const phoneNumber = member.phone.replace(/[\s\-().+]/g, '');
    const url = `whatsapp://send?phone=91${phoneNumber}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to wa.me link
        await Linking.openURL(`https://wa.me/91${phoneNumber}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  };

  const handleShareQR = async () => {
    try {
      if (qrCodeRef.current && qrCodeRef.current.capture) {
        // Capture the QR code as an image
        const uri = await qrCodeRef.current.capture();
        
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: `Share ${member.name}'s QR Code`,
          });
        } else {
          Alert.alert('Error', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hidden QR Code for sharing */}
      <View style={styles.hiddenQRContainer}>
        <ViewShot ref={qrCodeRef} options={{ format: 'png', quality: 1.0 }}>
          <View style={styles.qrCodeCard}>
            <Text style={styles.qrCardTitle}>{member.name}</Text>
            <QRCode
              value={`MEMBER:${member.id}`}
              size={250}
              logo={require('../assets/logo.png')}
              logoSize={50}
              logoBackgroundColor="white"
              logoBorderRadius={10}
            />
            <Text style={styles.qrCardSubtitle}>Scan to view profile</Text>
          </View>
        </ViewShot>
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Member Details</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareQR}
        >
          <Ionicons name="share-social" size={24} color="#6B46C1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image source={getImage(member.photo || 'ids/default.jpg')} style={styles.profilePhoto} resizeMode="cover" />
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberRole}>{member.role}</Text>
          {isPlaceholder && (
            <View style={styles.placeholderBadge}>
              <Ionicons name="information-circle" size={16} color="#FF6B6B" />
              <Text style={[styles.placeholderText, { marginLeft: 5 }]}>Details not available</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Ionicons name="call" size={24} color="#6B46C1" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                <Text style={styles.detailValue}>{member.phone || 'Not available'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={24} color="#6B46C1" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{member.email || 'Not available'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={24} color="#6B46C1" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{member.address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Ionicons name="water" size={24} color="#6B46C1" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Blood Group</Text>
                <Text style={styles.detailValue}>{member.bloodGroup || 'Not available'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.callButton, (isPlaceholder || !member.phone) && styles.disabledButton]}
          onPress={handleCall}
          disabled={isPlaceholder || !member.phone}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.whatsappButton, (isPlaceholder || !member.phone) && styles.disabledButton]}
          onPress={handleWhatsApp}
          disabled={isPlaceholder || !member.phone}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.emailButton, (isPlaceholder || !member.email) && styles.disabledButton]}
          onPress={handleEmail}
          disabled={isPlaceholder || !member.email}
        >
          <Ionicons name="mail" size={20} color="#fff" />
          <Text style={styles.buttonText}>Email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  hiddenQRContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  qrCodeCard: {
    backgroundColor: '#fff',
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCardTitle: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  qrCardSubtitle: {
    fontSize: scaleFont(14),
    color: '#666',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: spacing.xs,
  },
  shareButton: {
    padding: spacing.xs,
  },
  logo: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
  },
  headerTitle: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profilePhoto: {
    width: moderateScale(180),
    height: moderateScale(180),
    borderRadius: moderateScale(20),
    marginBottom: spacing.md,
  },
  memberName: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  memberRole: {
    fontSize: scaleFont(16),
    color: '#666',
  },
  placeholderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: moderateScale(20),
    marginTop: spacing.sm,

  },
  placeholderText: {
    fontSize: scaleFont(14),
    color: '#FF6B6B',
    fontWeight: '500',
  },
  detailsContainer: {
    padding: spacing.lg,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: scaleFont(14),
    color: '#999',
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: scaleFont(16),
    color: '#333',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: moderateScale(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: moderateScale(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emailButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: moderateScale(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: scaleFont(13),
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
});

export default MemberDetailScreen;
