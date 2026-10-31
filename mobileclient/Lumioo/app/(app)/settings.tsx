import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, Switch, Modal, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';
import { ConfirmModal } from '@/components/modals';
import { SelectField } from '@/components/LocationFields';
import { useToast } from '@/components/Toast';
import { changePassword } from '@/lib/social';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const MIN_PASSWORD = 8; // mesmo mínimo exigido no cadastro
const PREF_KEYS = { notifications: 'pref_notifications', email: 'pref_email_notifications', language: 'pref_language' };
const LANGUAGES = [
  { value: 'pt-br', label: 'Português (Brasil)' },
  { value: 'en', label: 'English' },
];

const TERMS = `1. Aceitação
Ao usar o Lumioo você concorda com estes termos. A plataforma é voltada à comunidade acadêmica, para compartilhar projetos, trabalhos e pesquisas.

2. Conteúdo
Você é responsável pelo que publica e declara ter os direitos sobre trabalhos, imagens e textos enviados. Conteúdo ofensivo, plágio ou violação de direitos autorais pode ser removido.

3. Conta
Mantenha sua senha em sigilo. Atividades realizadas com sua conta são de sua responsabilidade.

4. Alterações
Estes termos podem ser atualizados. O uso continuado da plataforma indica concordância com a versão vigente.`;

const PRIVACY = `1. Dados coletados
Coletamos os dados informados no cadastro (nome, e-mail acadêmico, instituição, nível acadêmico e data de nascimento) e o conteúdo que você publica.

2. Uso das informações
Os dados são usados para operar a plataforma, exibir seu perfil e permitir a interação entre usuários. Seu e-mail e data de nascimento só são visíveis para você.

3. Compartilhamento
Não vendemos seus dados. Posts, projetos e trabalhos públicos podem ser vistos por outros usuários; trabalhos privados exigem sua autorização.

4. Seus direitos
Você pode editar seus dados no perfil, bloquear outros usuários e solicitar a exclusão da conta.`;

// ─── Blocos reutilizáveis ────────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[s.section, { backgroundColor: 'rgba(30,41,59,0.5)', borderColor: 'rgba(51,65,85,0.5)' }]}>
      <View style={s.sectionHead}>
        <Ionicons name={icon} size={19} color={colors.primary} />
        <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function LinkRow({ icon, label, hint, onPress, last = false }: {
  icon: IconName; label: string; hint?: string; onPress: () => void; last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={({ pressed }) => [s.linkRow, !last && { borderBottomColor: colors.borderDark, borderBottomWidth: StyleSheet.hairlineWidth }, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name={icon} size={18} color={colors.textTertiary} />
      <View style={{ flex: 1 }}>
        <Text style={[s.linkLabel, { color: colors.textSecondary }]}>{label}</Text>
        {!!hint && <Text style={[s.hint, { color: colors.textMuted }]}>{hint}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

function PasswordField({ label, value, onChangeText, placeholder }: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder: string;
}) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[s.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[s.inputWrap, { backgroundColor: colors.container, borderColor: colors.border }]}>
        <TextInput
          style={[s.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable onPress={() => setVisible(v => !v)} hitSlop={10}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

function ToggleRow({ title, description, value, onChange }: {
  title: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={s.toggleRow}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[s.linkLabel, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[s.hint, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={v => { Haptics.selectionAsync(); onChange(v); }}
        trackColor={{ false: colors.containerLight, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

function TextModal({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <View style={[s.modalHeader, { paddingTop: insets.top + 10, borderBottomColor: colors.borderDark }]}>
          <Text style={[s.modalTitle, { color: colors.primary }]}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} style={[s.closeBtn, { backgroundColor: colors.containerLight }]}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
          <Text style={[s.legal, { color: colors.textSecondary }]}>{body}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Tela ────────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast, show } = useToast();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [language, setLanguage] = useState('pt-br');

  const [legal, setLegal] = useState<'terms' | 'privacy' | null>(null);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Preferências ficam no aparelho (a API ainda não tem endpoint de preferências)
  useEffect(() => {
    (async () => {
      try {
        const [n, e, l] = await Promise.all([
          SecureStore.getItemAsync(PREF_KEYS.notifications),
          SecureStore.getItemAsync(PREF_KEYS.email),
          SecureStore.getItemAsync(PREF_KEYS.language),
        ]);
        if (n !== null) setNotifications(n === '1');
        if (e !== null) setEmailNotifications(e === '1');
        if (l) setLanguage(l);
      } catch { /* usa os padrões */ }
    })();
  }, []);

  const savePref = (key: string, value: string) => { SecureStore.setItemAsync(key, value).catch(() => {}); };

  const passwordError =
    next.length > 0 && next.length < MIN_PASSWORD ? `A nova senha precisa ter ao menos ${MIN_PASSWORD} caracteres.`
    : next.length > 0 && next === current ? 'A nova senha deve ser diferente da atual.'
    : null;
  const canSubmit = current.length > 0 && next.length >= MIN_PASSWORD && next !== current && !saving;

  const handleChangePassword = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      show('Senha alterada com sucesso!');
      setCurrent('');
      setNext('');
    } catch (err: any) {
      const status = err?.response?.status;
      show(
        status === 401 ? 'A senha atual está incorreta.'
        : status === 429 ? 'Muitas tentativas. Tente novamente em 15 minutos.'
        : err?.response?.data?.error ?? 'Não foi possível alterar a senha.',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLogoutVisible(false);
    await logout();
    router.replace('/auth/login');
  };

  const navBarHeight = Math.max(insets.bottom, 8) + 16 + 72;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
        <Ionicons name="settings-outline" size={26} color={colors.primary} />
        <Text style={[s.title, { color: colors.textPrimary }]}>Configurações</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: navBarHeight + 24 }}
        >
          {/* Conta */}
          <Section icon="person-outline" title="Conta">
            {user && (
              <Pressable
                onPress={() => router.push('/(app)/profile' as any)}
                style={[s.account, { borderBottomColor: colors.borderDark }]}
              >
                <Avatar userImage={user.avatar} username={user.username} size={46} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.accountName, { color: colors.textPrimary }]} numberOfLines={1}>{user.fullName}</Text>
                  <Text style={[s.hint, { color: colors.textMuted }]} numberOfLines={1}>@{user.username}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            )}
            <LinkRow icon="create-outline" label="Editar perfil" hint="Nome, usuário, bio, foto e capa" onPress={() => router.push('/edit-profile' as any)} />
            <LinkRow icon="ban-outline" label="Usuários bloqueados" onPress={() => router.push('/blocked-users' as any)} last />
          </Section>

          {/* Segurança */}
          <Section icon="lock-closed-outline" title="Segurança">
            <PasswordField label="Senha atual" value={current} onChangeText={setCurrent} placeholder="Digite sua senha atual" />
            <PasswordField label="Nova senha" value={next} onChangeText={setNext} placeholder="Digite sua nova senha" />
            {!!passwordError && <Text style={[s.error, { color: colors.error }]}>{passwordError}</Text>}
            <Pressable
              onPress={handleChangePassword}
              disabled={!canSubmit}
              style={[s.primaryBtn, { backgroundColor: canSubmit ? colors.primary : `${colors.primary}50` }]}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Alterar senha</Text>}
            </Pressable>
          </Section>

          {/* Notificações */}
          <Section icon="notifications-outline" title="Notificações">
            <ToggleRow
              title="Notificações no app"
              description="Receber notificações dentro do Lumioo"
              value={notifications}
              onChange={v => { setNotifications(v); savePref(PREF_KEYS.notifications, v ? '1' : '0'); }}
            />
            <ToggleRow
              title="Notificações por email"
              description="Receber notificações no seu email"
              value={emailNotifications}
              onChange={v => { setEmailNotifications(v); savePref(PREF_KEYS.email, v ? '1' : '0'); }}
            />
          </Section>

          {/* Preferências */}
          <Section icon="globe-outline" title="Preferências">
            <Text style={[s.label, { color: colors.textSecondary }]}>Idioma</Text>
            <SelectField
              value={language}
              options={LANGUAGES}
              placeholder="Selecione um idioma"
              title="Idioma"
              onChange={v => { setLanguage(v); savePref(PREF_KEYS.language, v); }}
            />
          </Section>

          {/* Ajuda e Suporte */}
          <Section icon="help-circle-outline" title="Ajuda e Suporte">
            <LinkRow icon="document-text-outline" label="Termos de Serviço" onPress={() => setLegal('terms')} />
            <LinkRow icon="shield-checkmark-outline" label="Política de Privacidade" onPress={() => setLegal('privacy')} last />
          </Section>

          {/* Sair */}
          <Section icon="log-out-outline" title="Sair">
            <Text style={[s.logoutText, { color: colors.textTertiary }]}>Deseja sair da sua conta?</Text>
            <Pressable
              onPress={() => setLogoutVisible(true)}
              style={[s.primaryBtn, { backgroundColor: colors.primary, flexDirection: 'row', gap: 8 }]}
            >
              <Ionicons name="log-out-outline" size={18} color="#fff" />
              <Text style={s.primaryBtnText}>Sair da conta</Text>
            </Pressable>
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>

      {toast}

      {legal && (
        <TextModal
          title={legal === 'terms' ? 'Termos de Serviço' : 'Política de Privacidade'}
          body={legal === 'terms' ? TERMS : PRIVACY}
          onClose={() => setLegal(null)}
        />
      )}

      <ConfirmModal
        visible={logoutVisible}
        title="Tem certeza que deseja sair?"
        message="Você será desconectado da sua conta."
        confirmLabel="Sair"
        destructive
        onConfirm={handleLogout}
        onClose={() => setLogoutVisible(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  account: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12, marginBottom: 2, borderBottomWidth: StyleSheet.hairlineWidth },
  accountName: { fontSize: 15, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  linkLabel: { fontSize: 15, fontWeight: '500' },
  hint: { fontSize: 12, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  error: { fontSize: 12, marginBottom: 12, marginTop: -6 },
  primaryBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  logoutText: { fontSize: 14, marginBottom: 14 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  legal: { fontSize: 14, lineHeight: 22 },
});
