<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Eye, Plus, Trash2 } from 'lucide-vue-next'
import Graph from "@/components/Graph.vue"
import Layout from "@/components/Layout.vue"
import * as svarms from "@/lib/svarms"
import type { SvarmsData, Location, Person, Swarm } from "@/lib/svarms"
import LocationEditor from "@/components/editor/LocationEditor.vue"
import PersonEditor from "@/components/editor/PersonEditor.vue"
import SwarmEditor from "@/components/editor/SwarmEditor.vue"
import YamlPreview from "@/components/editor/YamlPreview.vue"

// Initialize with empty data or sample data
const data = ref<SvarmsData>({
  locations: [],
  people: [],
  swarms: []
})

const activeTab = ref('locations')
const showPreview = ref(false)

// Add new location
function addLocation() {
  const newLocation: Location = {
    id: `plant-${Date.now()}`,
    name: "New Plant",
    color: "blue-500",
    icon: "Building",
    url: ""
  }
  data.value.locations.push(newLocation)
}

// Remove location
function removeLocation(index: number) {
  data.value.locations.splice(index, 1)
}

// Add new person
function addPerson() {
  const newPerson: Person = {
    id: `person-${Date.now()}`,
    name: "New Person",
    location: data.value.locations[0]?.id || '',
    color: "blue-500",
    icon: "User",
    url: ""
  }
  data.value.people.push(newPerson)
}

// Remove person
function removePerson(index: number) {
  data.value.people.splice(index, 1)
}

// Add new swarm
function addSwarm() {
  const newSwarm: Swarm = {
    id: `swarm-${Date.now()}`,
    name: "New SAK",
    color: "blue-500",
    icon: "Box",
    url: "",
    roles: []
  }
  data.value.swarms.push(newSwarm)
}

// Remove swarm
function removeSwarm(index: number) {
  data.value.swarms.splice(index, 1)
}

// Export YAML
function exportYaml() {
  const yaml = svarms.write(data.value)
  const blob = new Blob([yaml], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'svarms.yaml'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Import YAML
function importYaml(yamlString: string) {
  try {
    const parsed = svarms.read(yamlString)
    data.value = parsed
  } catch (error) {
    console.error('Failed to parse YAML:', error)
    alert('Invalid YAML format')
  }
}

const hasData = computed(() => {
  return data.value.locations.length > 0 || 
         data.value.people.length > 0 || 
         data.value.swarms.length > 0
})
</script>

<template>
  <Layout>
    <template #header-actions>
      <Button variant="ghost" size="sm" as-child>
        <a href="/">Viewer</a>
      </Button>
      <Button variant="outline" size="sm" @click="showPreview = !showPreview">
        <Eye class="w-4 h-4 mr-2" />
        {{ showPreview ? 'Hide' : 'Show' }} Preview
      </Button>
      <Button size="sm" @click="exportYaml">
        <Download class="w-4 h-4 mr-2" />
        Export YAML
      </Button>
    </template>

    <div class="flex-1 flex">
      <div class="w-full">
        <div class="mb-4">
          <h1 class="text-2xl font-bold">sVarms Visual Editor</h1>
          <p class="text-sm text-muted-foreground">Create and edit svarms YAML files visually</p>
        </div>

    <div class="flex h-[calc(100vh-200px)]">
      <!-- Editor Panel -->
      <div class="flex-1 overflow-auto p-6">
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-4">
            <TabsTrigger value="locations">Locations ({{ data.locations.length }})</TabsTrigger>
            <TabsTrigger value="people">People ({{ data.people.length }})</TabsTrigger>
            <TabsTrigger value="swarms">Swarms ({{ data.swarms.length }})</TabsTrigger>
            <TabsTrigger value="yaml">YAML Preview</TabsTrigger>
          </TabsList>

          <!-- Locations Tab -->
          <TabsContent value="locations" class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Locations (Plants)</h2>
              <Button @click="addLocation" size="sm">
                <Plus class="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>
            
            <div class="grid gap-4">
              <Card v-for="(location, index) in data.locations" :key="location.id">
                <CardHeader class="pb-3">
                  <div class="flex items-center justify-between">
                    <CardTitle class="text-base">{{ location.name }}</CardTitle>
                    <Button variant="ghost" size="icon" @click="removeLocation(index)">
                      <Trash2 class="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <LocationEditor 
                    v-model="data.locations[index]" 
                    :all-locations="data.locations"
                  />
                </CardContent>
              </Card>
            </div>

            <div v-if="data.locations.length === 0" class="text-center py-12 text-muted-foreground">
              No locations yet. Click "Add Location" to create one.
            </div>
          </TabsContent>

          <!-- People Tab -->
          <TabsContent value="people" class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">People</h2>
              <Button @click="addPerson" size="sm" :disabled="data.locations.length === 0">
                <Plus class="w-4 h-4 mr-2" />
                Add Person
              </Button>
            </div>

            <div v-if="data.locations.length === 0" class="text-center py-12 text-muted-foreground">
              Create at least one location first.
            </div>
            
            <div class="grid gap-4">
              <Card v-for="(person, index) in data.people" :key="person.id">
                <CardHeader class="pb-3">
                  <div class="flex items-center justify-between">
                    <CardTitle class="text-base">{{ person.name }}</CardTitle>
                    <Button variant="ghost" size="icon" @click="removePerson(index)">
                      <Trash2 class="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <PersonEditor 
                    v-model="data.people[index]" 
                    :locations="data.locations"
                    :swarms="data.swarms"
                  />
                </CardContent>
              </Card>
            </div>

            <div v-if="data.people.length === 0 && data.locations.length > 0" class="text-center py-12 text-muted-foreground">
              No people yet. Click "Add Person" to create one.
            </div>
          </TabsContent>

          <!-- Swarms Tab -->
          <TabsContent value="swarms" class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Swarms (SAKs)</h2>
              <Button @click="addSwarm" size="sm" :disabled="data.people.length === 0">
                <Plus class="w-4 h-4 mr-2" />
                Add Swarm
              </Button>
            </div>

            <div v-if="data.people.length === 0" class="text-center py-12 text-muted-foreground">
              Create at least one person first.
            </div>
            
            <div class="grid gap-4">
              <Card v-for="(swarm, index) in data.swarms" :key="swarm.id">
                <CardHeader class="pb-3">
                  <div class="flex items-center justify-between">
                    <CardTitle class="text-base">{{ swarm.name }}</CardTitle>
                    <Button variant="ghost" size="icon" @click="removeSwarm(index)">
                      <Trash2 class="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <SwarmEditor 
                    v-model="data.swarms[index]" 
                    :people="data.people"
                  />
                </CardContent>
              </Card>
            </div>

            <div v-if="data.swarms.length === 0 && data.people.length > 0" class="text-center py-12 text-muted-foreground">
              No swarms yet. Click "Add Swarm" to create one.
            </div>
          </TabsContent>

          <!-- YAML Preview Tab -->
          <TabsContent value="yaml">
            <YamlPreview 
              :data="data" 
              @import="importYaml"
            />
          </TabsContent>
        </Tabs>
      </div>

      <!-- Preview Panel -->
      <div v-if="showPreview" class="w-1/2 border-l bg-muted/10">
        <div class="h-full flex flex-col">
          <div class="border-b px-4 py-3 bg-background">
            <h3 class="font-semibold">Live Preview</h3>
          </div>
          <div class="flex-1 p-4">
            <div v-if="!hasData" class="h-full flex items-center justify-center text-muted-foreground">
              Add some data to see the preview
            </div>
            <Graph 
              v-else 
              :data="data" 
              class="h-full rounded-lg border bg-background"
            />
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
