import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '@theme/index';
import { useCategoryStore } from '@store/category-store';
import { Input } from '@ui/input';
import { Button } from '@ui/button';
import { CategoryIcon } from '@ui/category-icon';
import { isValidCategoryName } from '@utils/validators';

const COLOR_OPTIONS = [
  '#F97316', '#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4',
  '#EC4899', '#F59E0B', '#4ADE80', '#34D399', '#C6F135',
  '#6B7280', '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9',
];

const ICON_OPTIONS = [
  'food', 'car', 'home', 'heart-pulse', 'school', 'gamepad-variant',
  'shopping', 'cash-multiple', 'laptop', 'trending-up', 'airplane',
  'music', 'book-open-variant', 'dumbbell', 'coffee', 'phone', 'wifi',
  'gas-station', 'hospital-building', 'account-group', 'gift',
  'dots-horizontal',
];

export default function EditCategoryModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const category = getCategoryById(id);

  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? ICON_OPTIONS[0]);
  const [color, setColor] = useState(category?.color ?? COLOR_OPTIONS[0]);
  const [error, setError] = useState('');
  const [emojiModalOpen, setEmojiModalOpen] = useState(false);
  const [emojiInput, setEmojiInput] = useState('');

  if (!category) { router.back(); return null; }

  function handleSave() {
    if (!isValidCategoryName(name)) { setError('Nome deve ter entre 2 e 30 caracteres'); return; }
    setError('');
    updateCategory(id, { name: name.trim(), icon, color });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  const isCustomEmoji = icon && !/^[a-z0-9-]+$/.test(icon) && !ICON_OPTIONS.includes(icon);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Editar categoria</Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Input label="Nome" value={name} onChangeText={setName} maxLength={30} />

        <View style={styles.preview}>
          <View style={[styles.previewIcon, { backgroundColor: color + '22' }]}>
            <CategoryIcon icon={icon} size={28} color={color} />
          </View>
          <Text style={[styles.previewName, { color }]}>{name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Cor</Text>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ícone</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map((i) => (
              <TouchableOpacity
                key={i}
                style={[styles.iconBtn, icon === i && styles.iconBtnActive]}
                onPress={() => setIcon(i)}
              >
                <CategoryIcon icon={i} size={22} color={icon === i ? color : colors.text.secondary} />
              </TouchableOpacity>
            ))}

            {/* Emoji customizado já salvo */}
            {isCustomEmoji && (
              <TouchableOpacity
                style={[styles.iconBtn, styles.iconBtnActive]}
                onPress={() => { setEmojiInput(icon); setEmojiModalOpen(true); }}
                activeOpacity={0.8}
              >
                <Text style={styles.emojiText}>{icon}</Text>
              </TouchableOpacity>
            )}

            {/* Botão + */}
            <TouchableOpacity
              style={styles.iconBtnAdd}
              onPress={() => { setEmojiInput(''); setEmojiModalOpen(true); }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={20} color={colors.accent.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal emoji */}
        <Modal visible={emojiModalOpen} transparent animationType="fade" onRequestClose={() => setEmojiModalOpen(false)}>
          <TouchableOpacity style={styles.emojiOverlay} activeOpacity={1} onPress={() => setEmojiModalOpen(false)} />
          <View style={styles.emojiSheet}>
            <Text style={styles.emojiSheetTitle}>Adicionar emoji</Text>
            <Text style={styles.emojiSheetSub}>Abra o teclado de emojis e selecione um</Text>
            <TextInput
              value={emojiInput}
              onChangeText={(v) => setEmojiInput(v.slice(-2))}
              style={styles.emojiInput}
              placeholder="😀"
              placeholderTextColor={colors.text.tertiary}
              autoFocus
            />
            <View style={styles.emojiActions}>
              <TouchableOpacity
                style={[styles.emojiConfirm, { opacity: emojiInput ? 1 : 0.4 }]}
                onPress={() => {
                  if (emojiInput.trim()) {
                    setIcon(emojiInput.trim());
                    setEmojiModalOpen(false);
                  }
                }}
                disabled={!emojiInput}
              >
                <Text style={styles.emojiConfirmText}>Usar este emoji</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Salvar" onPress={handleSave} size="lg" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg,
  },
  title: { ...typography.heading.lg, color: colors.text.primary },
  content: { padding: spacing['2xl'], gap: spacing.xl, paddingBottom: spacing['4xl'] },
  section: { gap: spacing.sm },
  sectionLabel: { ...typography.label.md, color: colors.text.secondary },
  preview: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  previewIcon: { width: 64, height: 64, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  previewName: { ...typography.heading.md },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  colorDot: { width: 32, height: 32, borderRadius: radius.full },
  colorDotActive: { borderWidth: 3, borderColor: colors.white },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconBtn: {
    width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background.tertiary, borderWidth: 1, borderColor: colors.border.default,
  },
  iconBtnActive: { borderColor: colors.accent.primary + '66', backgroundColor: colors.accent.muted },
  iconBtnAdd: {
    width: 44, height: 44, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.accent.muted,
    borderWidth: 1, borderColor: colors.accent.primary + '55',
    borderStyle: 'dashed',
  },
  emojiText: { fontSize: 22, textAlign: 'center' },
  emojiOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  emojiSheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing['2xl'],
    gap: spacing.lg,
    paddingBottom: 40,
  },
  emojiSheetTitle: { ...typography.heading.md, color: colors.text.primary, textAlign: 'center' },
  emojiSheetSub: { ...typography.body.sm, color: colors.text.tertiary, textAlign: 'center' },
  emojiInput: {
    fontSize: 48, textAlign: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing.lg,
    minHeight: 90,
    color: colors.text.primary,
  },
  emojiActions: { alignItems: 'center' },
  emojiConfirm: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
  },
  emojiConfirmText: { ...typography.label.lg, color: colors.text.inverse, fontWeight: '700' },
  error: { ...typography.body.sm, color: colors.semantic.expense, textAlign: 'center' },
});
