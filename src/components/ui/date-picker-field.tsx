import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@theme/index';
import { formatDate, toISODate } from '@utils/date';
import { ptBR } from 'date-fns/locale';
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths } from 'date-fns';

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface DatePickerFieldProps {
  label?: string;
  value: string; // 'YYYY-MM-DD'
  onChange: (date: string) => void;
}

export function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date(value + 'T12:00:00'));
  const [selected, setSelected] = useState(() => new Date(value + 'T12:00:00'));

  function handleOpen() {
    const d = new Date(value + 'T12:00:00');
    setViewDate(d);
    setSelected(d);
    setOpen(true);
  }

  function handleConfirm() {
    onChange(toISODate(selected));
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
  }

  function handleSelectDay(day: number) {
    setSelected(new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12));
  }

  function buildCalendar() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = getDaysInMonth(new Date(year, month));
    const firstWeekDay = getDay(startOfMonth(new Date(year, month))); // 0=Sun
    const cells: (number | null)[] = [];

    for (let i = 0; i < firstWeekDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }

  const cells = buildCalendar();
  const monthLabel = format(viewDate, 'MMMM yyyy', { locale: ptBR });

  const isSelected = (day: number) =>
    selected.getDate() === day &&
    selected.getMonth() === viewDate.getMonth() &&
    selected.getFullYear() === viewDate.getFullYear();

  const isToday = (day: number) => {
    const t = new Date();
    return t.getDate() === day && t.getMonth() === viewDate.getMonth() && t.getFullYear() === viewDate.getFullYear();
  };

  return (
    <>
      {/* Campo tocável */}
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TouchableOpacity style={styles.field} onPress={handleOpen} activeOpacity={0.8}>
          <MaterialCommunityIcons name="calendar" size={18} color={colors.text.tertiary} />
          <Text style={styles.fieldValue}>
            {formatDate(value, "dd 'de' MMMM 'de' yyyy")}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Modal calendário */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={handleCancel}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleCancel} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header do sheet */}
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={handleCancel} hitSlop={12}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>Selecionar data</Text>
            <TouchableOpacity onPress={handleConfirm} hitSlop={12}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {/* Navegação de mês */}
          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={() => setViewDate(subMonths(viewDate, 1))}
              hitSlop={12}
              style={styles.navBtn}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <Text style={styles.monthLabel}>{monthLabel}</Text>

            <TouchableOpacity
              onPress={() => setViewDate(addMonths(viewDate, 1))}
              hitSlop={12}
              style={styles.navBtn}
            >
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Dias da semana */}
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((d) => (
              <Text key={d} style={styles.weekDay}>{d}</Text>
            ))}
          </View>

          {/* Grade de dias */}
          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

              const selected_ = isSelected(day);
              const today = isToday(day);

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[
                    styles.dayCell,
                    today && !selected_ && styles.dayCellToday,
                    selected_ && styles.dayCellSelected,
                  ]}
                  onPress={() => handleSelectDay(day)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      today && !selected_ && styles.dayTextToday,
                      selected_ && styles.dayTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Data selecionada */}
          <View style={styles.selectedRow}>
            <Text style={styles.selectedLabel}>
              {format(selected, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - spacing['2xl'] * 2 - spacing.md * 6) / 7);

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { ...typography.label.md, color: colors.text.secondary },
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
  fieldValue: {
    ...typography.body.lg,
    color: colors.text.primary,
    flex: 1,
    textTransform: 'capitalize',
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border.default,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    marginBottom: spacing.lg,
  },
  sheetTitle: { ...typography.heading.sm, color: colors.text.primary },
  cancelText: { ...typography.label.lg, color: colors.text.secondary },
  confirmText: { ...typography.label.lg, color: colors.accent.primary, fontWeight: '700' },

  // Navegação de mês
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.sm,
  },
  monthLabel: {
    ...typography.heading.md,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },

  // Semana
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDay: {
    width: CELL_SIZE,
    textAlign: 'center',
    ...typography.label.sm,
    color: colors.text.tertiary,
  },

  // Grade
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.accent.primary + '66',
  },
  dayCellSelected: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.full,
  },
  dayText: {
    ...typography.body.md,
    color: colors.text.primary,
  },
  dayTextToday: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: colors.text.inverse,
    fontWeight: '700',
  },

  // Data selecionada
  selectedRow: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  selectedLabel: {
    ...typography.label.lg,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
});
