import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type Props = {
  onFinish: () => void;
};

const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous pulse for the outer logo glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo animation sequence
    Animated.sequence([
      // Logo fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 30,
          useNativeDriver: true,
        }),
      ]),
      // Text fade in and slide up
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Navigate to main app after a short delay
      setTimeout(() => {
        onFinish();
      }, 2000);
    });
  }, []);

  return (
    <LinearGradient
      colors={['#8B5CF6', '#6B46C1', '#4C1D95']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoGlow,
              { transform: [{ scale: pulseAnim }] }
            ]}
          />
          <View style={styles.logoCircle}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.appName}>Mahila Mandal</Text>
          <Text style={styles.appSubtitle}>Member Directory</Text>
          <View style={styles.decorativeLine} />
        </Animated.View>
      </View>

      {/* Credits section at bottom */}
      <Animated.View
        style={[
          styles.creditsContainer,
          {
            opacity: textFadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Text style={styles.creditsText}>In Loving Memory of Late Malthi K Raichura</Text>
      </Animated.View>

      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 2,
  },
  logo: {
    width: 160,
    height: 160,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#E9D5FF',
    marginTop: 8,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: '#FFB800',
    borderRadius: 2,
    marginTop: 20,
  },
  creditsContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  creditsText: {
    color: '#E9D5FF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.8,
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle3: {
    position: 'absolute',
    top: height * 0.3,
    right: -100,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
  },
});

export default SplashScreen;
