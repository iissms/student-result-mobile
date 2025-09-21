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
          activeOpacity={0.9}
          style={[styles.roleButton, role === 'student' && styles.activeRoleButton]}
          onPress={() => setRole('student')}
        >
          <Text style={[styles.roleText, role === 'student' && styles.activeRoleText]}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
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

        <View style={styles.divider} />

        <View style={styles.demoContainer}>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={toggleRole}
            activeOpacity={0.85}
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
    maxWidth: 420,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(28,109,208,0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#0B2A5B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#0B2A5B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
    }),
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[100],
    borderRadius: 14,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  roleButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeRoleButton: {
    backgroundColor: COLORS.primary[50],
    borderWidth: 1,
    borderColor: COLORS.primary[300],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
    }),
  },
  roleText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[600],
  },
  activeRoleText: {
    color: COLORS.primary[700],
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
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  demoContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(28,109,208,0.08)',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
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
