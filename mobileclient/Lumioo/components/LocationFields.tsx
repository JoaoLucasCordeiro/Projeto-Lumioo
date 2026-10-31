import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import {
  BRAZILIAN_UF_CODES, COUNTRY_OPTIONS, type LocationValue,
} from '@/constants/geo';

// ─── SelectField: campo que abre uma lista em modal ──────────────────────────

export interface SelectOption { value: string; label: string }

export function SelectField({ value, options, placeholder, title, onChange }: {
  value: string;
  options: SelectOption[];
  placeholder: string;
  title: string;
  onChange: (value: string) => void;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[s.field, { borderColor: colors.borderDark, backgroundColor: colors.container }]}
      >
        <Text
          style={[s.fieldText, { color: selected ? colors.textPrimary : colors.textMuted }]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[s.sheet, { backgroundColor: colors.container }]} onPress={() => {}}>
            <View style={s.sheetHeader}>
              <Text style={[s.sheetTitle, { color: colors.textPrimary }]}>{title}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={o => o.value}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => { onChange(item.value); setOpen(false); }}
                    style={[s.option, { borderBottomColor: colors.borderDark }]}
                  >
                    <Text style={[s.optionText, { color: active ? colors.primary : colors.textPrimary, fontWeight: active ? '700' : '400' }]}>
                      {item.label}
                    </Text>
                    {active && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── LocationFields: país, UF, cidade e campus ───────────────────────────────

const COUNTRY_SELECT_OPTIONS: SelectOption[] = COUNTRY_OPTIONS.map(c => ({ value: c, label: c }));
const UF_SELECT_OPTIONS: SelectOption[] = BRAZILIAN_UF_CODES.map(uf => ({ value: uf, label: uf }));

export function LocationFields({ value, onChange }: {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
}) {
  const { colors } = useTheme();
  const inputStyle = [s.input, { color: colors.textPrimary, borderColor: colors.borderDark, backgroundColor: colors.container }];
  const isBrazil = value.country === 'Brasil';

  return (
    <View style={{ gap: 10 }}>
      <SelectField
        value={value.country}
        options={COUNTRY_SELECT_OPTIONS}
        placeholder="País"
        title="País"
        onChange={country => onChange({ ...value, country, state: country === 'Brasil' ? value.state : '' })}
      />
      {isBrazil && (
        <SelectField
          value={value.state}
          options={UF_SELECT_OPTIONS}
          placeholder="Estado (UF)"
          title="Estado (UF)"
          onChange={state => onChange({ ...value, state })}
        />
      )}
      <TextInput
        style={inputStyle}
        value={value.city}
        onChangeText={city => onChange({ ...value, city })}
        placeholder="Cidade"
        placeholderTextColor={colors.textMuted}
        maxLength={150}
        autoCapitalize="words"
      />
      <TextInput
        style={inputStyle}
        value={value.campus}
        onChangeText={campus => onChange({ ...value, campus })}
        placeholder="Campus (opcional)"
        placeholderTextColor={colors.textMuted}
        maxLength={200}
        autoCapitalize="words"
      />
    </View>
  );
}

const s = StyleSheet.create({
  field: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
  },
  fieldText: { flex: 1, fontSize: 15, marginRight: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '70%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24 },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: { fontSize: 15 },
});
