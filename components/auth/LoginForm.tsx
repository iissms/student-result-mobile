import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, UserCheck } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
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

    if (newRole === 'student') {
      setEmail('student@example.com');
    } else {
      setEmail('parent@example.com');
    }
    setPassword('password');
  };

  return (
    <View style={styles.container}>
      <View style={styles.roleToggleContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.roleButton, role === 'student' && styles.activeRoleButton]}
          onPress={() => setRole('student')}
        >
          <Text style={[styles.roleText, role === 'student' && styles.activeRoleText]}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.roleButton, role === 'parent' && styles.activeRoleButton]}
          onPress={() => setRole('parent')}
        >
          <Text style={[styles.roleText, role === 'parent' && styles.activeRoleText]}>Parent</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {role === 'student'
          ? 'Sign in to access your academic results'
          : "Sign in to monitor your child's academic progress"}
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
          <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
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
          <TouchableOpacity style={styles.demoButton} onPress={toggleRole} activeOpacity={0.85}>
            <UserCheck size={18} color={COLORS.primary[600]} />
            <Text style={styles.demoButtonText}>
              Switch to {role === 'student' ? 'Parent' : 'Student'} Demo
            </Text>
          </TouchableOpacity>
          <Text style={styles.demoText}>
            For demo use {role === 'student' ? 'student@example.com' : 'parent@example.com'} and 'password'
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 420,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(12, 71, 161, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#0B2A5B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: '#0B2A5B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
    }),
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[100],
    borderRadius: 14,
    padding: 4,
    marginBottom: SPACING.md,
  },
  roleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeRoleButton: {
    backgroundColor: COLORS.primary[500],
  },
  roleText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[600],
  },
  activeRoleText: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  form: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  forgotPassword: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.primary[600],
  },
  loginButton: {
    marginTop: SPACING.sm,
  },
  demoContainer: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary[50],
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary[100],
    alignItems: 'center',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  demoButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[600],
    marginLeft: SPACING.xs,
  },
  demoText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 16,
  },
});
