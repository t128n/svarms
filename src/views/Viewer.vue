<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Graph from "@/components/Graph.vue";
import Layout from "@/components/Layout.vue";
import { Button } from "@/components/ui/button/";
import { Input } from "@/components/ui/input/";
import { Label } from "@/components/ui/label/";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, FilterIcon, XIcon, CheckIcon, ShareIcon } from 'lucide-vue-next'
import * as svarms from "@/lib/svarms";
import type { SvarmsData, GraphFilters } from "@/lib/svarms";
import { ofetch } from "ofetch";

const svarmsData = ref<SvarmsData | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const copyStatus = ref<'idle' | 'copying' | 'copied'>('idle');
const route = useRoute();
const router = useRouter();

// Parse query params from URL
function parseQueryParamArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(',').filter(Boolean);
}

// Create reactive state from URL query
const filterState = computed<Required<GraphFilters> & { behavior: 'hide' | 'dim' | 'show' }>({
  get: () => ({
    nodeTypes: parseQueryParamArray(route.query.nodeTypes as string) as ('location' | 'person' | 'swarm')[],
    locationIds: parseQueryParamArray(route.query.locationIds as string),
    personIds: parseQueryParamArray(route.query.personIds as string),
    swarmIds: parseQueryParamArray(route.query.swarmIds as string),
    roleTypes: parseQueryParamArray(route.query.roleTypes as string),
    searchQuery: (route.query.searchQuery as string) || '',
    behavior: (route.query.behavior as 'hide' | 'dim' | 'show') || 'hide'
  }),
  set: (newState) => {
    router.replace({
      query: {
        ...route.query,
        nodeTypes: newState.nodeTypes.length > 0 ? newState.nodeTypes : undefined,
        locationIds: newState.locationIds.length > 0 ? newState.locationIds : undefined,
        personIds: newState.personIds.length > 0 ? newState.personIds : undefined,
        swarmIds: newState.swarmIds.length > 0 ? newState.swarmIds : undefined,
        roleTypes: newState.roleTypes.length > 0 ? newState.roleTypes : undefined,
        searchQuery: newState.searchQuery || undefined,
        behavior: newState.behavior !== 'hide' ? newState.behavior : undefined
      }
    });
  }
});

// Create filters object from state
const filters = computed<GraphFilters>(() => ({
  nodeTypes: filterState.value.nodeTypes.length > 0 ? filterState.value.nodeTypes : undefined,
  locationIds: filterState.value.locationIds.length > 0 ? filterState.value.locationIds : undefined,
  personIds: filterState.value.personIds.length > 0 ? filterState.value.personIds : undefined,
  swarmIds: filterState.value.swarmIds.length > 0 ? filterState.value.swarmIds : undefined,
  roleTypes: filterState.value.roleTypes.length > 0 ? filterState.value.roleTypes : undefined,
  searchQuery: filterState.value.searchQuery || undefined
}));

const filteredNodeBehavior = computed(() => filterState.value.behavior);

const isFilterSheetOpen = ref(false);

// Popover states for multi-selects
const locationPopoverOpen = ref(false);
const personPopoverOpen = ref(false);
const swarmPopoverOpen = ref(false);
const rolePopoverOpen = ref(false);

onMounted(async () => {
  try {
    // Load configuration to get default file path
    const config = await ofetch('/svarms.json', {
      method: 'GET',
      responseType: 'json'
    });

    const defaultFilePath = config.default || '/svarms/sak.yaml';

    // Load the specified YAML file
    const yamlContent = await ofetch(defaultFilePath, {
      method: 'GET',
      responseType: 'text'
    });
    svarmsData.value = svarms.read(yamlContent);
    isLoading.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load svarms data';
    isLoading.value = false;
    console.error('Failed to load svarms data:', err);
  }
});

// Computed options for filters
const availableLocations = computed(() => {
  return svarmsData.value?.locations || [];
});

const availablePeople = computed(() => {
  return svarmsData.value?.people || [];
});

const availableSwarms = computed(() => {
  return svarmsData.value?.swarms || [];
});

const availableRoles = computed(() => {
  if (!svarmsData.value) return [];
  const roles = new Set<string>();
  svarmsData.value.swarms.forEach(swarm => {
    swarm.roles.forEach(role => roles.add(role.role));
  });
  return Array.from(roles).sort();
});

// Node type options
const nodeTypeOptions = [
  { value: 'location' as const, label: 'Locations' },
  { value: 'person' as const, label: 'People' },
  { value: 'swarm' as const, label: 'Swarms' }
];

// Toggle node type
function toggleNodeType(type: 'location' | 'person' | 'swarm') {
  const current = filterState.value.nodeTypes || [];
  if (current.includes(type)) {
    updateFilterState({ nodeTypes: current.filter(t => t !== type) });
  } else {
    updateFilterState({ nodeTypes: [...current, type] });
  }
}

// Toggle location
function toggleLocation(locationId: string) {
  const current = filterState.value.locationIds || [];
  if (current.includes(locationId)) {
    updateFilterState({ locationIds: current.filter(id => id !== locationId) });
  } else {
    updateFilterState({ locationIds: [...current, locationId] });
  }
}

// Toggle person
function togglePerson(personId: string) {
  const current = filterState.value.personIds || [];
  if (current.includes(personId)) {
    updateFilterState({ personIds: current.filter(id => id !== personId) });
  } else {
    updateFilterState({ personIds: [...current, personId] });
  }
}

// Toggle swarm
function toggleSwarm(swarmId: string) {
  const current = filterState.value.swarmIds || [];
  if (current.includes(swarmId)) {
    updateFilterState({ swarmIds: current.filter(id => id !== swarmId) });
  } else {
    updateFilterState({ swarmIds: [...current, swarmId] });
  }
}

// Toggle role
function toggleRole(role: string) {
  const current = filterState.value.roleTypes || [];
  if (current.includes(role)) {
    updateFilterState({ roleTypes: current.filter(r => r !== role) });
  } else {
    updateFilterState({ roleTypes: [...current, role] });
  }
}

// Helper to update filter state
async function updateFilterState(updates: Partial<typeof filterState.value>) {
  filterState.value = {
    ...filterState.value,
    ...updates
  };
}

// Update search query
function updateSearchQuery(query: string) {
  updateFilterState({ searchQuery: query });
}

// Update behavior
function updateBehavior(behavior: 'hide' | 'dim' | 'show') {
  updateFilterState({ behavior });
}

// Clear all filters
function clearFilters() {
  updateFilterState({
    nodeTypes: [],
    locationIds: [],
    personIds: [],
    swarmIds: [],
    roleTypes: [],
    searchQuery: '',
    behavior: 'hide'
  });
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return (
    filterState.value.nodeTypes.length > 0 ||
    filterState.value.locationIds.length > 0 ||
    filterState.value.personIds.length > 0 ||
    filterState.value.swarmIds.length > 0 ||
    filterState.value.roleTypes.length > 0 ||
    filterState.value.searchQuery.trim()
  );
});

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0;
  count += filterState.value.nodeTypes.length;
  count += filterState.value.locationIds.length;
  count += filterState.value.personIds.length;
  count += filterState.value.swarmIds.length;
  count += filterState.value.roleTypes.length;
  if (filterState.value.searchQuery.trim()) count += 1;
  return count;
});

// Copy URL to clipboard
async function copyShareUrl() {
  copyStatus.value = 'copying';
  const url = window.location.href;
  await navigator.clipboard.writeText(url);
  copyStatus.value = 'copied';
  setTimeout(() => {
    copyStatus.value = 'idle';
  }, 2000);
}
</script>

<template>
  <Layout>
    <template #header-actions>
      <Button variant="ghost" size="sm" as-child>
        <a href="/editor">Editor</a>
      </Button>
      <Button
        v-if="hasActiveFilters"
        variant="ghost"
        size="sm"
        class="gap-2"
        :disabled="copyStatus === 'copying'"
        @click="copyShareUrl"
      >
        <ShareIcon class="h-4 w-4" />
        {{ copyStatus === 'copying' ? 'Copying...' : copyStatus === 'copied' ? 'Copied!' : 'Share' }}
      </Button>

      <Sheet v-model:open="isFilterSheetOpen">
          <SheetTrigger as-child>
            <Button variant="outline" size="sm" class="gap-2">
              <FilterIcon class="h-4 w-4" />
              Filters
              <span v-if="activeFilterCount > 0" class="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                {{ activeFilterCount }}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent class="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Graph</SheetTitle>
              <SheetDescription>
                Customize which nodes and connections are displayed. Filters are saved to the URL.
              </SheetDescription>
            </SheetHeader>

            <div class="py-6 px-4 space-y-6">
              <!-- Search -->
              <div class="space-y-2">
                <Label>Search</Label>
                <Input
                  :model-value="filterState.searchQuery"
                  @update:model-value="updateSearchQuery"
                  placeholder="Search by name..."
                  class="w-full"
                />
              </div>

              <Separator />

              <!-- Node Types -->
              <div class="space-y-3">
                <Label>Node Types</Label>
                <div class="flex flex-wrap gap-2">
                  <Button
                    v-for="type in nodeTypeOptions"
                    :key="type.value"
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-primary text-primary-foreground': filterState.nodeTypes?.includes(type.value) }"
                    @click="toggleNodeType(type.value)"
                  >
                    {{ type.label }}
                  </Button>
                </div>
              </div>

              <Separator />

              <!-- Locations -->
              <div class="space-y-2">
                <Label>Locations</Label>
                <Popover v-model:open="locationPopoverOpen">
                  <PopoverTrigger as-child>
                    <Button variant="outline" class="w-full justify-between">
                      {{ filterState.locationIds?.length ? `${filterState.locationIds.length} selected` : 'Select locations...' }}
                      <FilterIcon class="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search locations..." />
                      <CommandList>
                        <CommandEmpty>No locations found</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="location in availableLocations"
                            :key="location.id"
                            :value="location.id"
                            @select="toggleLocation(location.id)"
                          >
                            <div class="flex items-center gap-2 flex-1">
                              <div
                                class="w-3 h-3 rounded-full"
                                :style="{ backgroundColor: location.color }"
                              />
                              {{ location.name }}
                            </div>
                            <CheckIcon
                              v-if="filterState.locationIds?.includes(location.id)"
                              class="h-4 w-4"
                            />
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <!-- People -->
              <div class="space-y-2">
                <Label>People</Label>
                <Popover v-model:open="personPopoverOpen">
                  <PopoverTrigger as-child>
                    <Button variant="outline" class="w-full justify-between">
                      {{ filterState.personIds?.length ? `${filterState.personIds.length} selected` : 'Select people...' }}
                      <FilterIcon class="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search people..." />
                      <CommandList>
                        <CommandEmpty>No people found</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="person in availablePeople"
                            :key="person.id"
                            :value="person.id"
                            @select="togglePerson(person.id)"
                          >
                            <div class="flex items-center gap-2 flex-1">
                              {{ person.name }}
                            </div>
                            <CheckIcon
                              v-if="filterState.personIds?.includes(person.id)"
                              class="h-4 w-4"
                            />
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <!-- Swarms -->
              <div class="space-y-2">
                <Label>Swarms</Label>
                <Popover v-model:open="swarmPopoverOpen">
                  <PopoverTrigger as-child>
                    <Button variant="outline" class="w-full justify-between">
                      {{ filterState.swarmIds?.length ? `${filterState.swarmIds.length} selected` : 'Select swarms...' }}
                      <FilterIcon class="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search swarms..." />
                      <CommandList>
                        <CommandEmpty>No swarms found</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="swarm in availableSwarms"
                            :key="swarm.id"
                            :value="swarm.id"
                            @select="toggleSwarm(swarm.id)"
                          >
                            <div class="flex items-center gap-2 flex-1">
                              {{ swarm.name }}
                            </div>
                            <CheckIcon
                              v-if="filterState.swarmIds?.includes(swarm.id)"
                              class="h-4 w-4"
                            />
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <!-- Roles -->
              <div class="space-y-2">
                <Label>Roles</Label>
                <Popover v-model:open="rolePopoverOpen">
                  <PopoverTrigger as-child>
                    <Button variant="outline" class="w-full justify-between">
                      {{ filterState.roleTypes?.length ? `${filterState.roleTypes.length} selected` : 'Select roles...' }}
                      <FilterIcon class="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search roles..." />
                      <CommandList>
                        <CommandEmpty>No roles found</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="role in availableRoles"
                            :key="role"
                            :value="role"
                            @select="toggleRole(role)"
                          >
                            <div class="flex items-center gap-2 flex-1 capitalize">
                              {{ role }}
                            </div>
                            <CheckIcon
                              v-if="filterState.roleTypes?.includes(role)"
                              class="h-4 w-4"
                            />
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Separator />

              <!-- Filter Behavior -->
              <div class="space-y-3">
                <Label>Filter Behavior</Label>
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-primary text-primary-foreground': filterState.behavior === 'hide' }"
                    @click="updateBehavior('hide')"
                  >
                    Hide
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-primary text-primary-foreground': filterState.behavior === 'dim' }"
                    @click="updateBehavior('dim')"
                  >
                    Dim
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-primary text-primary-foreground': filterState.behavior === 'show' }"
                    @click="updateBehavior('show')"
                  >
                    Show All
                  </Button>
                </div>
              </div>

              <!-- Clear Filters -->
              <div v-if="hasActiveFilters" class="pt-4 space-y-2">
                <Button variant="ghost" class="w-full gap-2" @click="clearFilters">
                  <XIcon class="h-4 w-4" />
                  Clear all filters
                </Button>
                <p class="text-xs text-muted-foreground text-center">
                  Filters are automatically saved to the URL
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
    </template>

    <div v-if="isLoading" class="flex-1 flex items-center justify-center text-muted-foreground">
      Loading...
    </div>
    <div v-else-if="error" class="flex-1 flex items-center justify-center text-red-500">
      Error: {{ error }}
    </div>
    <Graph
      v-else
      :data="svarmsData"
      :filters="hasActiveFilters ? filters : undefined"
      :filtered-node-behavior="filteredNodeBehavior"
      class="flex-1"
    />
  </Layout>
</template>
