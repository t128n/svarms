<script setup lang="ts">
import { computed } from 'vue'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from 'lucide-vue-next'
import type { Swarm, Person } from "@/lib/svarms"
import IconSelect from "./IconSelect.vue"
import ColorSelect from "./ColorSelect.vue"

const props = defineProps<{
  modelValue: Swarm
  people: Person[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Swarm]
}>()

function updateField<K extends keyof Swarm>(field: K, value: Swarm[K]) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function addRole() {
  const newRoles = [...props.modelValue.roles]
  // Find first person not already in swarm
  const availablePerson = props.people.find(p => 
    !props.modelValue.roles.some(r => r.person === p.id)
  )
  if (availablePerson) {
    newRoles.push({
      person: availablePerson.id,
      role: 'member'
    })
    updateField('roles', newRoles)
  }
}

function removeRole(index: number) {
  const newRoles = [...props.modelValue.roles]
  newRoles.splice(index, 1)
  updateField('roles', newRoles)
}

function updateRolePerson(index: number, personId: string) {
  const newRoles = [...props.modelValue.roles]
  newRoles[index] = { ...newRoles[index], person: personId }
  updateField('roles', newRoles)
}

function updateRoleType(index: number, roleType: string) {
  const newRoles = [...props.modelValue.roles]
  newRoles[index] = { ...newRoles[index], role: roleType }
  updateField('roles', newRoles)
}

const availablePeople = computed(() => {
  return props.people.filter(p => 
    !props.modelValue.roles.some(r => r.person === p.id)
  )
})
</script>

<template>
  <div class="grid gap-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="swarm-id">ID</Label>
        <Input 
          id="swarm-id" 
          :model-value="modelValue.id"
          @update:model-value="updateField('id', $event)"
          placeholder="iot-sak"
        />
      </div>
      
      <div class="space-y-2">
        <Label for="swarm-name">Name</Label>
        <Input 
          id="swarm-name" 
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="IoT SAK"
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
      <Label for="swarm-url">URL (Optional)</Label>
      <Input 
        id="swarm-url" 
        :model-value="modelValue.url || ''"
        @update:model-value="updateField('url', $event || undefined)"
        placeholder="https://example.com/swarm/iot-sak"
      />
    </div>

    <!-- Roles Management -->
    <div class="space-y-3 pt-4 border-t">
      <div class="flex items-center justify-between">
        <Label>Members</Label>
        <Button 
          @click="addRole" 
          size="sm" 
          variant="outline"
          :disabled="availablePeople.length === 0"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div v-if="modelValue.roles.length === 0" class="text-sm text-muted-foreground">
        No members yet. Click "Add Member" to assign people to this SAK.
      </div>

      <div v-else class="space-y-2">
        <div 
          v-for="(role, index) in modelValue.roles" 
          :key="index"
          class="flex items-center gap-2 p-2 rounded-lg border bg-muted/30"
        >
          <Select 
            :model-value="role.person" 
            @update:model-value="updateRolePerson(index, $event)"
            class="flex-1"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select person" />
            </SelectTrigger>
            <SelectContent>
              <!-- Include currently selected person even if they're already assigned -->
              <SelectItem :value="role.person">
                {{ people.find(p => p.id === role.person)?.name }} (Current)
              </SelectItem>
              <SelectItem 
                v-for="person in availablePeople" 
                :key="person.id" 
                :value="person.id"
              >
                {{ person.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select 
            :model-value="role.role" 
            @update:model-value="updateRoleType(index, $event)"
            class="w-32"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leader">Leader</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="ghost" 
            size="icon"
            @click="removeRole(index)"
          >
            <Trash2 class="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
