<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Copy, Check } from 'lucide-vue-next'
import * as svarms from "@/lib/svarms"
import type { SvarmsData } from "@/lib/svarms"

const props = defineProps<{
  data: SvarmsData
}>()

const emit = defineEmits<{
  import: [yaml: string]
}>()

const yamlOutput = computed(() => {
  return svarms.write(props.data)
})

const importText = ref('')
const copied = ref(false)

function copyToClipboard() {
  navigator.clipboard.writeText(yamlOutput.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function handleImport() {
  if (importText.value.trim()) {
    emit('import', importText.value)
    importText.value = ''
  }
}
</script>

<template>
  <div class="grid gap-6">
    <!-- Export Section -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label>Generated YAML</Label>
        <Button variant="outline" size="sm" @click="copyToClipboard">
          <Check v-if="copied" class="w-4 h-4 mr-2" />
          <Copy v-else class="w-4 h-4 mr-2" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </Button>
      </div>
      <Textarea 
        :model-value="yamlOutput" 
        readonly 
        class="font-mono text-sm min-h-[400px]"
      />
    </div>

    <!-- Import Section -->
    <div class="space-y-2 pt-4 border-t">
      <Label>Import YAML</Label>
      <p class="text-sm text-muted-foreground">
        Paste existing svarms YAML here to load it into the editor.
        <strong class="text-destructive">Warning: This will replace all current data!</strong>
      </p>
      <Textarea 
        v-model="importText"
        placeholder="Paste YAML here..."
        class="font-mono text-sm min-h-[150px]"
      />
      <Button 
        @click="handleImport" 
        variant="secondary"
        :disabled="!importText.trim()"
        class="w-full"
      >
        <Upload class="w-4 h-4 mr-2" />
        Import YAML
      </Button>
    </div>
  </div>
</template>
