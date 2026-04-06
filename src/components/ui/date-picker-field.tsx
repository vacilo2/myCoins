import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@theme/index';
import { formatDate } from '@utils/date';
import { toISODate } from '@utils/date';

interface DatePickerFieldProps {
  label?: string;
  value: string; // ISO date string: 'YYYY-MM-DD'
  onChange: (date: string) => void;
}

export function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(value));

  function handleOpen() {
    setTempDate(new Date(value));
    setOpen(true);
  }

  function handleConfirm() {
    onChange(toISODate(tempDate));
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
  }

  return (
    <>
      {/* Campo tocável */}
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TouchableOpacity style={styles.field} onPress={handleOpen} activeOpacity={0.8}>
          <MaterialCommunityIcons name="calendar" size={18} color={colors.text.tertiary} />
          <Text style={styles.value}>{formatDate(value, "dd 'de' MMMM 'de' yyyy")}</Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Modal com calendário */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleCancel} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={handleCancel} hitSlop={12}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>Selecionar data</Text>
            <TouchableOpacity onPress={handleConfirm} hitSlop={12}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {/* Calendário nativo iOS */}
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="inline"
            onChange={(_, date) => date && setTempDate(date)}
            style={styles.picker}
            themeVariant="dark"
            accentColor={colors.accent.primary}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label.md,
    color: colors.text.secondary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  value: {
    ...typography.body.lg,
    color: colors.text.primary,
    flex: 1,
    textTransform: 'capitalize',
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border.default,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  sheetTitle: {
    ...typography.heading.sm,
    color: colors.text.primary,
  },
  cancelText: {
    ...typography.label.lg,
    color: colors.text.secondary,
  },
  confirmText: {
    ...typography.label.lg,
    color: colors.accent.primary,
    fontWeight: '700',
  },
  picker: {
    marginHorizontal: spacing.md,
  },
});
