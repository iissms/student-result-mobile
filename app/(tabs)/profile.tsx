import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import Header from '@/components/shared/Header';
import Card from '@/components/ui/Card';
import { User, School, Bell, Settings, CircleHelp as HelpCircle, LogOut, Book, Calendar } from 'lucide-react-native';

export default function ProfileScreen() {
  const { authState, logout } = useAuth();
  const router = useRouter();
  
  if (!authState.user) {
    return null;
  }
  
  const handleLogout = () => {
    logout();
    router.replace('/');
  };
  
  const renderProfileInfo = () => (
    <Card style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: authState.user.avatar }} 
          style={styles.avatar} 
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{authState.user.name}</Text>
          <Text style={styles.role}>{authState.user.role === 'student' ? 'Student' : 'Parent'}</Text>
        </View>
      </View>
      
      {authState.user.role === 'student' && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Class</Text>
            <Text style={styles.detailValue}>{authState.user.class}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Student ID</Text>
            <Text style={styles.detailValue}>{authState.user.studentId}</Text>
          </View>
        </View>
      )}
      
      {authState.user.role === 'parent' && authState.user.children && (
        <View style={styles.childrenContainer}>
          <Text style={styles.sectionTitle}>Children</Text>
          {authState.user.children.map(child => (
            <View key={child.id} style={styles.childItem}>
              <View style={styles.childAvatar}>
                <User size={18} color="#FFFFFF" />
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childClass}>Class {child.class}</Text>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </Card>
  );
  
  const renderMenuItem = (icon: React.ReactNode, title: string, onPress: () => void) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <Text style={styles.menuItemText}>{title}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Header title="My Profile" />
      
      <ScrollView style={styles.scrollView}>
        {renderProfileInfo()}
        
        <Card style={styles.menuCard}>
          <Text style={styles.menuSectionTitle}>Academic</Text>
          
          {renderMenuItem(
            <Book size={20} color={COLORS.primary[500]} />,
            'Academic Records',
            () => {}
          )}
          
          {renderMenuItem(
            <Calendar size={20} color={COLORS.primary[500]} />,
            'Academic Calendar',
            () => {}
          )}
          
          {renderMenuItem(
            <School size={20} color={COLORS.primary[500]} />,
            'Subjects & Courses',
            () => {}
          )}
        </Card>
        
        <Card style={styles.menuCard}>
          <Text style={styles.menuSectionTitle}>Preferences</Text>
          
          {renderMenuItem(
            <Bell size={20} color={COLORS.primary[500]} />,
            'Notifications',
            () => {}
          )}
          
          {renderMenuItem(
            <Settings size={20} color={COLORS.primary[500]} />,
            'Settings',
            () => {}
          )}
          
          {renderMenuItem(
            <HelpCircle size={20} color={COLORS.primary[500]} />,
            'Help & Support',
            () => {}
          )}
        </Card>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={COLORS.error[500]} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Academic Insights v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  profileCard: {
    marginVertical: SPACING.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary[500],
  },
  profileInfo: {
    marginLeft: SPACING.md,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  role: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray[600],
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  detailsContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: SPACING.md,
  },
  childrenContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  childAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  childClass: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  viewButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary[500],
    borderRadius: 4,
  },
  viewButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#FFFFFF',
  },
  editButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.primary[500],
  },
  menuCard: {
    marginVertical: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  menuSectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  menuItemText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[800],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.error[50],
    borderRadius: 8,
  },
  logoutText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.error[500],
    marginLeft: SPACING.xs,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  versionText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[500],
  },
});