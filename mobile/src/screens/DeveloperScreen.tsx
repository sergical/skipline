import React from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native'
import { colors, spacing } from '@/theme'
import { useStore } from '@/state/useStore'

export default function DeveloperScreen() {
  const { apiBaseUrl, apiVersion, scenario, setApiBaseUrl, setApiVersion, setScenario, lastTraceIds } = useStore()

  return (
    <View style={styles.container}>
      <Text style={styles.label}>API Base URL</Text>
      <TextInput value={apiBaseUrl} onChangeText={setApiBaseUrl} style={styles.input} />

      <Text style={styles.label}>API Version</Text>
      <View style={styles.row}>
        {(['v1','v2'] as const).map(v => (
          <TouchableOpacity key={v} style={[styles.toggle, apiVersion === v && styles.toggleActive]} onPress={() => setApiVersion(v)}>
            <Text style={{ color: apiVersion === v ? 'white' : colors.text }}>{v.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Scenario</Text>
      <View style={styles.row}>
        {['', 'BlackFriday'].map(s => (
          <TouchableOpacity key={s} style={[styles.toggle, scenario === s && styles.toggleActive]} onPress={() => setScenario(s || null)}>
            <Text style={{ color: scenario === s ? 'white' : colors.text }}>{s || 'None'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Recent Trace IDs</Text>
      <FlatList data={lastTraceIds} keyExtractor={(i) => i} renderItem={({ item }) => (
        <View style={styles.trace}><Text selectable>{item}</Text></View>
      )} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand, padding: spacing(2) },
  label: { marginTop: spacing(2), marginBottom: spacing(1), fontWeight: '600', color: colors.indigo },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 12 },
  row: { flexDirection: 'row', gap: spacing(1) },
  toggle: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#E8ECEF' },
  toggleActive: { backgroundColor: colors.accent },
  trace: { backgroundColor: 'white', padding: 8, borderRadius: 8, marginVertical: 4 },
})
