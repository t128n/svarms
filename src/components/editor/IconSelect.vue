<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const icons = [
  { value: 'Building', label: 'Building' },
  { value: 'CircleUser', label: 'Circle User' },
  { value: 'User', label: 'User' },
  { value: 'Cpu', label: 'CPU' },
  { value: 'Droplets', label: 'Droplets' },
  { value: 'Layers', label: 'Layers' },
  { value: 'CheckCircle', label: 'Check Circle' },
  { value: 'Box', label: 'Box' },
  { value: 'MapPin', label: 'Map Pin' },
  { value: 'Server', label: 'Server' },
  { value: 'Database', label: 'Database' },
  { value: 'Cloud', label: 'Cloud' }
]
</script>

<template>
  <Select :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <SelectTrigger>
      <SelectValue :placeholder="'Select icon'" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="icon in icons" :key="icon.value" :value="icon.value">
        {{ icon.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
