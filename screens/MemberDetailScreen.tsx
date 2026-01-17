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
import { Member } from './DirectoryScreen';

type RootStackParamList = {
  Directory: undefined;
  MemberDetail: { member: Member };
  QRScanner: undefined;
};

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

  const handleCall = async () => {
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
          <Image source={getImage(member.photo)} style={styles.profilePhoto} />
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberRole}>{member.role}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Ionicons name="call" size={24} color="#6B46C1" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                <Text style={styles.detailValue}>{member.phone}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={24} color="#6B46C1" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{member.email}</Text>
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
                <Text style={styles.detailValue}>{member.bloodGroup}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call" size={24} color="#fff" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.emailButton} onPress={handleEmail}>
          <Ionicons name="mail" size={24} color="#fff" />
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
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrCardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  shareButton: {
    padding: 5,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
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
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profilePhoto: {
    width: 180,
    height: 180,
    borderRadius: 20,
    marginBottom: 15,
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  memberRole: {
    fontSize: 16,
    color: '#666',
  },
  detailsContainer: {
    padding: 20,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
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
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
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
    padding: 15,
    borderRadius: 12,
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
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default MemberDetailScreen;
