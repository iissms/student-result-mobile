import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, UserCheck } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const { login, authState } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'parent'>('student');
  
  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }
    
    await login(email, password);
  };
  
  const toggleRole = () => {
    const newRole = role === 'student' ? 'parent' : 'student';
    setRole(newRole);
    
    // Set demo credentials based on role
    if (newRole === 'student') {
      setEmail('student@example.com');
    } else {
      setEmail('parent@example.com');
    }
    setPassword('password'); // Demo password for both roles
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.roleToggleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'student' && styles.activeRoleButton
          ]}
          onPress={() => setRole('student')}
        >
          <Text style={[
            styles.roleText,
            role === 'student' && styles.activeRoleText
          ]}>
            Student
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'parent' && styles.activeRoleButton
          ]}
          onPress={() => setRole('parent')}
        >
          <Text style={[
            styles.roleText,
            role === 'parent' && styles.activeRoleText
          ]}>
            Parent
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>
        {role === 'student' 
          ? 'Sign in to access your academic results' 
          : 'Sign in to monitor your child\'s academic progress'}
      </Text>
      
      <View style={styles.form}>
        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={20} color={COLORS.gray[400]} />}
          error={authState.error}
        />
        
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          leftIcon={<Lock size={20} color={COLORS.gray[400]} />}
        />
        
        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        
        <Button
          title="Login"
          onPress={handleLogin}
          loading={authState.isLoading}
          fullWidth
          style={styles.loginButton}
        />
        
        <View style={styles.demoContainer}>
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={toggleRole}
          >
            <UserCheck size={20} color={COLORS.primary[500]} />
            <Text style={styles.demoButtonText}>
              Switch to {role === 'student' ? 'Parent' : 'Student'} Demo
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.demoText}>
            For demo: use {role === 'student' ? 'student@example.com' : 'parent@example.com'} and 'password'
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.gray[900],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    padding: 4,
  },
  roleButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 6,
  },
  activeRoleButton: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  roleText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[500],
  },
  activeRoleText: {
    color: COLORS.gray[900],
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  form: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  forgotPassword: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[500],
  },
  loginButton: {
    marginTop: SPACING.sm,
  },
  demoContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
  },
  demoButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[500],
    marginLeft: SPACING.xs,
  },
  demoText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
});