import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../../constants/theme';
// import theme from '../../constants/theme';

const AppHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      {/* Left: Drawer Menu */}
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={styles.left}
        activeOpacity={0.7}
      >
        <Ionicons name="menu-outline" size={27} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Center: Logo */}
      <View style={styles.center}>
        <Image
          source={require('../../../assets/images/logo5.png')} // <-- update if needed
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Right: Notification */}
      <TouchableOpacity style={styles.right} activeOpacity={0.7}>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={theme.colors.text}
        />

        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
};

export default AppHeader;


const styles = StyleSheet.create({
  container: {
    paddingTop: 50, // Increased top padding for safe area
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1, // Optional: subtle separator
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    height: 32, // Slightly larger logo
    width: 140,
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.background,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
