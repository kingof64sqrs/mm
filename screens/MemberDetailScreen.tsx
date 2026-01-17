import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getImage } from '../utils/imageHelper';
import { Member } from './DirectoryScreen';

type RootStackParamList = {
  Directory: undefined;
  MemberDetail: { member: Member };
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image source={getImage(member.photo || 'ids/default.jpg')} style={styles.profilePhoto} />
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberRole}>{member.role}</Text>
          {isPlaceholder && (
            <View style={styles.placeholderBadge}>
              <Ionicons name="information-circle" size={16} color="#FF6B6B" />
              <Text style={styles.placeholderText}>Details not available</Text>
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
          <Ionicons name="call" size={24} color="#fff" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.emailButton, (isPlaceholder || !member.email) && styles.disabledButton]} 
          onPress={handleEmail}
          disabled={isPlaceholder || !member.email}
        >
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
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
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
  placeholderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    gap: 5,
  },
  placeholderText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
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
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
});

export default MemberDetailScreen;
