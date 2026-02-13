<script setup lang="ts">
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Location } from "@/lib/svarms"
import IconSelect from "./IconSelect.vue"
import ColorSelect from "./ColorSelect.vue"

const props = defineProps<{
  modelValue: Location
  allLocations: Location[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Location]
}>()

function updateField<K extends keyof Location>(field: K, value: Location[K]) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="loc-id">ID</Label>
        <Input 
          id="loc-id" 
          :model-value="modelValue.id"
          @update:model-value="updateField('id', $event)"
          placeholder="plant-munich"
        />
      </div>
      
      <div class="space-y-2">
        <Label for="loc-name">Name</Label>
        <Input 
          id="loc-name" 
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="Plant Munich"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label>Icon</Label>
        <IconSelect 
          :model-value="modelValue.icon"
          @update:model-value="updateField('icon', $event)"
        />
      </div>
      
      <div class="space-y-2">
        <Label>Color</Label>
        <ColorSelect 
          :model-value="modelValue.color"
          @update:model-value="updateField('color', $event)"
        />
      </div>
    </div>

    <div class="space-y-2">
      <Label for="loc-url">URL (Optional)</Label>
      <Input 
        id="loc-url" 
        :model-value="modelValue.url || ''"
        @update:model-value="updateField('url', $event || undefined)"
        placeholder="https://example.com/plants/munich"
      />
    </div>
  </div>
</template>
