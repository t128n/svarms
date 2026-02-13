<script setup lang="ts">
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Person, Location, Swarm } from "@/lib/svarms"
import IconSelect from "./IconSelect.vue"
import ColorSelect from "./ColorSelect.vue"

const props = defineProps<{
  modelValue: Person
  locations: Location[]
  swarms: Swarm[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Person]
}>()

function updateField<K extends keyof Person>(field: K, value: Person[K]) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="person-id">ID</Label>
        <Input 
          id="person-id" 
          :model-value="modelValue.id"
          @update:model-value="updateField('id', $event)"
          placeholder="klaus"
        />
      </div>
      
      <div class="space-y-2">
        <Label for="person-name">Name</Label>
        <Input 
          id="person-name" 
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="Klaus Weber"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label>Location</Label>
        <Select 
          :model-value="modelValue.location" 
          @update:model-value="updateField('location', $event)"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="location in locations" 
              :key="location.id" 
              :value="location.id"
            >
              {{ location.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div class="space-y-2">
        <Label>Icon</Label>
        <IconSelect 
          :model-value="modelValue.icon"
          @update:model-value="updateField('icon', $event)"
        />
      </div>
    </div>

    <div class="space-y-2">
      <Label>Color</Label>
      <ColorSelect 
        :model-value="modelValue.color"
        @update:model-value="updateField('color', $event)"
      />
    </div>

    <div class="space-y-2">
      <Label for="person-url">URL (Optional)</Label>
      <Input 
        id="person-url" 
        :model-value="modelValue.url || ''"
        @update:model-value="updateField('url', $event || undefined)"
        placeholder="https://example.com/people/klaus"
      />
    </div>

    <!-- Show which swarms this person belongs to -->
    <div v-if="swarms.length > 0" class="pt-2 border-t">
      <Label class="text-sm text-muted-foreground">Member of:</Label>
      <div class="flex flex-wrap gap-2 mt-2">
        <span 
          v-for="swarm in swarms.filter(s => s.roles.some(r => r.person === modelValue.id))" 
          :key="swarm.id"
          class="text-xs px-2 py-1 rounded-full bg-muted"
        >
          {{ swarm.name }} ({{ swarm.roles.find(r => r.person === modelValue.id)?.role }})
        </span>
        <span 
          v-if="swarms.filter(s => s.roles.some(r => r.person === modelValue.id)).length === 0"
          class="text-xs text-muted-foreground"
        >
          Not assigned to any SAK yet
        </span>
      </div>
    </div>
  </div>
</template>
