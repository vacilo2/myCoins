import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
  // Alimentação
  '🍔','🍕','🍣','🥗','🍜','🥩','🍱','☕','🧃','🍺','🥐','🍰',
  // Transporte
  '🚗','🚌','🏍️','✈️','🚂','🛵','🚕','⛽',
  // Casa & Contas
  '🏠','💡','💧','📱','📺','🛒','🔧','🏢',
  // Saúde
  '❤️','💊','🏥','🧘','🏋️','🦷','👁️','🩺',
  // Lazer & Cultura
  '🎮','🎵','🎬','📚','⚽','🎨','🎭','🎤',
  // Finanças & Trabalho
  '💰','💳','📈','💼','🏦','🎁','💸','🪙',
  // Pessoas & Estilo
  '👶','🐾','✂️','👗','💄','🧴','🏫','🤝',
  // Outros
  '🌱','🌍','⭐','🔔','📦','🗂️','❓','➕',
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

  if (!category) { router.back(); return null; }

  function handleSave() {
    if (!isValidCategoryName(name)) { setError('Nome deve ter entre 2 e 30 caracteres'); return; }
    setError('');
    updateCategory(id, { name: name.trim(), icon, color });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

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
                <CategoryIcon
                  icon={i}
                  size={22}
                  color={icon === i ? color : colors.text.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
  error: { ...typography.body.sm, color: colors.semantic.expense, textAlign: 'center' },
});
