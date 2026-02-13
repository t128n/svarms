<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const colors = [
  { value: 'slate-500', label: 'Slate', shade: '500', color: '#64748b' },
  { value: 'slate-600', label: 'Slate', shade: '600', color: '#475569' },
  { value: 'slate-700', label: 'Slate', shade: '700', color: '#334155' },
  { value: 'slate-800', label: 'Slate', shade: '800', color: '#1e293b' },
  { value: 'gray-500', label: 'Gray', shade: '500', color: '#6b7280' },
  { value: 'gray-600', label: 'Gray', shade: '600', color: '#4b5563' },
  { value: 'zinc-500', label: 'Zinc', shade: '500', color: '#71717a' },
  { value: 'zinc-600', label: 'Zinc', shade: '600', color: '#52525b' },
  { value: 'neutral-500', label: 'Neutral', shade: '500', color: '#737373' },
  { value: 'neutral-600', label: 'Neutral', shade: '600', color: '#525252' },
  { value: 'stone-500', label: 'Stone', shade: '500', color: '#78716c' },
  { value: 'stone-600', label: 'Stone', shade: '600', color: '#57534e' },
  { value: 'red-400', label: 'Red', shade: '400', color: '#f87171' },
  { value: 'red-500', label: 'Red', shade: '500', color: '#ef4444' },
  { value: 'red-600', label: 'Red', shade: '600', color: '#dc2626' },
  { value: 'orange-400', label: 'Orange', shade: '400', color: '#fb923c' },
  { value: 'orange-500', label: 'Orange', shade: '500', color: '#f97316' },
  { value: 'orange-600', label: 'Orange', shade: '600', color: '#ea580c' },
  { value: 'amber-400', label: 'Amber', shade: '400', color: '#fbbf24' },
  { value: 'amber-500', label: 'Amber', shade: '500', color: '#f59e0b' },
  { value: 'amber-600', label: 'Amber', shade: '600', color: '#d97706' },
  { value: 'yellow-400', label: 'Yellow', shade: '400', color: '#facc15' },
  { value: 'yellow-500', label: 'Yellow', shade: '500', color: '#eab308' },
  { value: 'yellow-600', label: 'Yellow', shade: '600', color: '#ca8a04' },
  { value: 'green-400', label: 'Green', shade: '400', color: '#4ade80' },
  { value: 'green-500', label: 'Green', shade: '500', color: '#22c55e' },
  { value: 'green-600', label: 'Green', shade: '600', color: '#16a34a' },
  { value: 'emerald-400', label: 'Emerald', shade: '400', color: '#34d399' },
  { value: 'emerald-500', label: 'Emerald', shade: '500', color: '#10b981' },
  { value: 'emerald-600', label: 'Emerald', shade: '600', color: '#059669' },
  { value: 'teal-400', label: 'Teal', shade: '400', color: '#2dd4bf' },
  { value: 'teal-500', label: 'Teal', shade: '500', color: '#14b8a6' },
  { value: 'teal-600', label: 'Teal', shade: '600', color: '#0d9488' },
  { value: 'cyan-400', label: 'Cyan', shade: '400', color: '#22d3ee' },
  { value: 'cyan-500', label: 'Cyan', shade: '500', color: '#06b6d4' },
  { value: 'cyan-600', label: 'Cyan', shade: '600', color: '#0891b2' },
  { value: 'sky-400', label: 'Sky', shade: '400', color: '#38bdf8' },
  { value: 'sky-500', label: 'Sky', shade: '500', color: '#0ea5e9' },
  { value: 'sky-600', label: 'Sky', shade: '600', color: '#0284c7' },
  { value: 'blue-400', label: 'Blue', shade: '400', color: '#60a5fa' },
  { value: 'blue-500', label: 'Blue', shade: '500', color: '#3b82f6' },
  { value: 'blue-600', label: 'Blue', shade: '600', color: '#2563eb' },
  { value: 'indigo-400', label: 'Indigo', shade: '400', color: '#818cf8' },
  { value: 'indigo-500', label: 'Indigo', shade: '500', color: '#6366f1' },
  { value: 'indigo-600', label: 'Indigo', shade: '600', color: '#4f46e5' },
  { value: 'violet-400', label: 'Violet', shade: '400', color: '#a78bfa' },
  { value: 'violet-500', label: 'Violet', shade: '500', color: '#8b5cf6' },
  { value: 'violet-600', label: 'Violet', shade: '600', color: '#7c3aed' },
  { value: 'purple-400', label: 'Purple', shade: '400', color: '#c084fc' },
  { value: 'purple-500', label: 'Purple', shade: '500', color: '#a855f7' },
  { value: 'purple-600', label: 'Purple', shade: '600', color: '#9333ea' },
  { value: 'fuchsia-400', label: 'Fuchsia', shade: '400', color: '#e879f9' },
  { value: 'fuchsia-500', label: 'Fuchsia', shade: '500', color: '#d946ef' },
  { value: 'pink-400', label: 'Pink', shade: '400', color: '#f472b6' },
  { value: 'pink-500', label: 'Pink', shade: '500', color: '#ec4899' },
  { value: 'pink-600', label: 'Pink', shade: '600', color: '#db2777' },
  { value: 'rose-400', label: 'Rose', shade: '400', color: '#fb7185' },
  { value: 'rose-500', label: 'Rose', shade: '500', color: '#f43f5e' },
  { value: 'rose-600', label: 'Rose', shade: '600', color: '#e11d48' }
]
</script>

<template>
  <Select :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <SelectTrigger>
      <SelectValue :placeholder="'Select color'">
        <template v-if="modelValue">
          <div class="flex items-center gap-2">
            <div 
              class="w-4 h-4 rounded-full border" 
              :style="{ backgroundColor: colors.find(c => c.value === modelValue)?.color }"
            />
            {{ colors.find(c => c.value === modelValue)?.label }} {{ colors.find(c => c.value === modelValue)?.shade }}
          </div>
        </template>
      </SelectValue>
    </SelectTrigger>
    <SelectContent class="max-h-[300px]">
      <SelectItem v-for="color in colors" :key="color.value" :value="color.value">
        <div class="flex items-center gap-2">
          <div 
            class="w-4 h-4 rounded-full border" 
            :style="{ backgroundColor: color.color }"
          />
          {{ color.label }} {{ color.shade }}
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>
