<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Determine if we're on the viewer page
const isViewer = computed(() => route.path === '/')
</script>

<template>
  <div class="min-h-dvh flex flex-col gap-8">
    <header class="border-muted flex flex-row py-4 px-8 justify-between items-center border-b-2">
      <a href="/" class="font-medium">s<span class="font-semibold text-green-500">V</span>arms</a>
      <div class="flex items-center gap-2">
        <slot name="header-actions" />
      </div>
    </header>
    
    <main class="flex flex-col flex-1 gap-4 py-4 px-8">
      <slot />
    </main>
    
    <footer class="flex flex-row justify-between py-4 px-8 items-center border-t-2 border-muted">
      <p class="text-sm text-muted-foreground">sVarms &mdash; Open Source Swarm Visualization</p>
      <p class="text-sm text-muted-foreground">&copy; 2026 <a href="https://t128n.dev">Torben Haack</a></p>
    </footer>
  </div>
</template>
