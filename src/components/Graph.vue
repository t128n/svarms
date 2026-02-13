<template>
  <VChart 
    class="flex-1" 
    :option="option"
    @mouseover="handleMouseOver"
    @mouseout="handleMouseOut"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { GraphChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { ref, computed, watch } from "vue";
import type { SvarmsData, Location, Person, Swarm } from "@/lib/svarms";
import { getLucideSymbol } from "@/lib/lucide-helpers";

// Track hovered node for connection highlighting
const hoveredNodeId = ref<string | null>(null);
const hoverDimOpacity = 0.1;

// Handle mouse over event on nodes
function handleMouseOver(params: any) {
  if (params.dataType === 'node') {
    hoveredNodeId.value = params.data.id;
  }
}

// Handle mouse out event
function handleMouseOut() {
  hoveredNodeId.value = null;
}

// Handle click event on nodes
function handleClick(params: any) {
  if (params.dataType === 'node' && params.data.url) {
    window.open(params.data.url, '_blank');
  }
}

interface GraphFilters {
  nodeTypes?: ('location' | 'person' | 'swarm')[];
  locationIds?: string[];
  personIds?: string[];
  swarmIds?: string[];
  roleTypes?: string[];
  searchQuery?: string;
}

const props = defineProps<{
  data: SvarmsData | null;
  filters?: GraphFilters;
  filteredNodeBehavior?: 'hide' | 'dim' | 'show';
  dimOpacity?: number;
}>();

const effectiveDimOpacity = computed(() => props.dimOpacity ?? 0.2);

// Filter checking functions
function matchesNodeTypeFilter(category: string): boolean {
  if (!props.filters?.nodeTypes?.length) return true;
  return props.filters.nodeTypes.includes(category as any);
}

function matchesLocationFilter(locationId: string): boolean {
  if (!props.filters?.locationIds?.length) return true;
  return props.filters.locationIds.includes(locationId);
}

function matchesPersonFilter(personId: string): boolean {
  if (!props.filters?.personIds?.length) return true;
  return props.filters.personIds.includes(personId);
}

function matchesSwarmFilter(swarmId: string): boolean {
  if (!props.filters?.swarmIds?.length) return true;
  return props.filters.swarmIds.includes(swarmId);
}

function matchesRoleFilter(personId: string, allRoles: Map<string, string[]>): boolean {
  if (!props.filters?.roleTypes?.length) return true;
  const personRoles = allRoles.get(personId) || [];
  return props.filters.roleTypes.some(role => personRoles.includes(role));
}

// Check if a location should be shown
function shouldShowLocation(location: Location): boolean {
  if (props.filteredNodeBehavior === 'show') return true;
  
  return (
    matchesNodeTypeFilter('location') &&
    matchesLocationFilter(location.id)
  );
}

// Check if a person should be shown
function shouldShowPerson(person: Person, allRoles: Map<string, string[]>): boolean {
  if (props.filteredNodeBehavior === 'show') return true;
  
  return (
    matchesNodeTypeFilter('person') &&
    matchesPersonFilter(person.id) &&
    matchesLocationFilter(person.location) &&
    matchesRoleFilter(person.id, allRoles)
  );
}

// Check if a swarm should be shown - must be defined before use in computed
function shouldShowSwarmNode(swarm: Swarm): boolean {
  if (props.filteredNodeBehavior === 'show') return true;
  
  return (
    matchesNodeTypeFilter('swarm') &&
    matchesSwarmFilter(swarm.id)
  );
}

// Check if node matches search
function matchesSearch(_nodeId: string, nodeName: string): boolean {
  if (!props.filters?.searchQuery?.trim()) return false;
  return nodeName.toLowerCase().includes(props.filters.searchQuery.toLowerCase().trim());
}

use([
  CanvasRenderer,
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

// Pre-loaded icon symbols cache
const iconSymbols = ref<Map<string, string>>(new Map())

// Pre-load all icons used in data when data changes
watch(() => props.data, (newData) => {
  if (!newData) return
  
  const iconsToLoad = new Set<string>()
  
  // Collect all unique icon+color combinations from data
  newData.locations.forEach(loc => iconsToLoad.add(`${loc.icon}:${loc.color}`))
  newData.people.forEach(person => iconsToLoad.add(`${person.icon}:${person.color}`))
  newData.swarms.forEach(swarm => iconsToLoad.add(`${swarm.icon}:${swarm.color}`))
  
  // Load all icons synchronously (they're already in JSON, so this is instant)
  const symbolMap = new Map<string, string>()
  iconsToLoad.forEach((key) => {
    const [iconName, color] = key.split(':')
    const symbol = getLucideSymbol(iconName!, color!)
    symbolMap.set(key, symbol)
  })
  
  iconSymbols.value = symbolMap
}, { immediate: true })

// Helper to get cached icon symbol
function getIconSymbol(iconName: string, color: string): string {
  const key = `${iconName}:${color}`
  return iconSymbols.value.get(key) || getLucideSymbol(iconName, color)
}

// Build adjacency list for connection lookup
function buildAdjacencyList(links: any[]): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  links.forEach(link => {
    const source = typeof link.source === 'string' ? link.source : link.source.id;
    const target = typeof link.target === 'string' ? link.target : link.target.id;
    
    if (!adjacency.has(source)) adjacency.set(source, new Set());
    if (!adjacency.has(target)) adjacency.set(target, new Set());
    
    adjacency.get(source)!.add(target);
    adjacency.get(target)!.add(source);
  });
  return adjacency;
}

const option = computed(() => {
  if (!props.data) {
    return {
      tooltip: {},
      series: [{
        type: "graph",
        layout: "force",
        data: [],
        links: []
      }]
    };
  }

  // Build person roles map for filtering
  const personRolesMap = new Map<string, string[]>();
  props.data.swarms.forEach(swarm => {
    swarm.roles.forEach(role => {
      const existing = personRolesMap.get(role.person) || [];
      if (!existing.includes(role.role)) {
        existing.push(role.role);
      }
      personRolesMap.set(role.person, existing);
    });
  });

  const nodes: any[] = [];
  const allNodeIds = new Set<string>();
  const searchMatchingIds = new Set<string>();
  
  // Determine visible vs dimmed nodes
  const behavior = props.filteredNodeBehavior ?? 'hide';
  const hasSearchFilter = !!props.filters?.searchQuery?.trim();

  // First pass: Build all nodes and track search matches
  // Process locations
  props.data.locations.forEach((location: Location) => {
    const nodeId = `loc-${location.id}`;
    allNodeIds.add(nodeId);
    
    if (hasSearchFilter && matchesSearch(nodeId, location.name)) {
      searchMatchingIds.add(nodeId);
    }
    
    nodes.push({
      id: nodeId,
      name: location.name,
      symbol: getIconSymbol(location.icon, location.color),
      category: 'location',
      url: location.url,
      cursor: location.url ? 'pointer' : 'default',
      _shouldShow: shouldShowLocation(location)
    });
  });

  // Process people
  props.data.people.forEach((person: Person) => {
    const nodeId = `person-${person.id}`;
    allNodeIds.add(nodeId);
    
    if (hasSearchFilter && matchesSearch(nodeId, person.name)) {
      searchMatchingIds.add(nodeId);
    }
    
    nodes.push({
      id: nodeId,
      name: person.name,
      symbol: getIconSymbol(person.icon, person.color),
      category: 'person',
      url: person.url,
      cursor: person.url ? 'pointer' : 'default',
      _shouldShow: shouldShowPerson(person, personRolesMap)
    });
  });

  // Process swarms
  props.data.swarms.forEach((swarm: Swarm) => {
    const swarmNodeId = `swarm-${swarm.id}`;
    allNodeIds.add(swarmNodeId);
    
    if (hasSearchFilter && matchesSearch(swarmNodeId, swarm.name)) {
      searchMatchingIds.add(swarmNodeId);
    }
    
    // Check if swarm should be visible based on role filtering
    const hasRoleFilter = props.filters?.roleTypes?.length;
    const visibleRoles = hasRoleFilter 
      ? swarm.roles.filter(role => props.filters!.roleTypes!.includes(role.role))
      : swarm.roles;
    
    nodes.push({
      id: swarmNodeId,
      name: swarm.name,
      symbol: getIconSymbol(swarm.icon, swarm.color),
      category: 'swarm',
      url: swarm.url,
      cursor: swarm.url ? 'pointer' : 'default',
      _shouldShow: shouldShowSwarmNode(swarm) && (!hasRoleFilter || visibleRoles.length > 0),
      _visibleRoles: visibleRoles
    });
  });

  // Build all links
  const links: any[] = [];
  
  // Add person-SAK links
  props.data.swarms.forEach((swarm: Swarm) => {
    const swarmNodeId = `swarm-${swarm.id}`;
    const hasRoleFilter = props.filters?.roleTypes?.length;
    const node = nodes.find(n => n.id === swarmNodeId);
    const visibleRoles = node?._visibleRoles || swarm.roles;
    
    visibleRoles.forEach((role: any) => {
      const personNodeId = `person-${role.person}`;
      const isRoleFiltered = hasRoleFilter && !props.filters!.roleTypes!.includes(role.role);
      
      links.push({
        source: personNodeId,
        target: swarmNodeId,
        label: {
          show: !isRoleFiltered,
          formatter: role.role,
          fontSize: 10
        },
        lineStyle: {
          width: isRoleFiltered ? 1 : 2,
          opacity: isRoleFiltered && behavior === 'dim' ? effectiveDimOpacity.value : 0.9,
          type: isRoleFiltered ? 'dotted' : 'solid'
        }
      });
    });
  });

  // Add person-location links
  props.data.people.forEach((person: Person) => {
    const personNodeId = `person-${person.id}`;
    const locNodeId = `loc-${person.location}`;
    
    links.push({
      source: personNodeId,
      target: locNodeId,
      lineStyle: {
        type: 'dashed',
        width: 1,
        opacity: 0.5
      }
    });
  });

  // Add links from sub-SAKs to Central SAK
  const centralSakId = 'swarm-central-sak';
  const subSakIds = ['swarm-iot-sak', 'swarm-glueing-sak', 'swarm-assembly-sak', 'swarm-quality-sak'];
  
  subSakIds.forEach(subSakId => {
    links.push({
      source: subSakId,
      target: centralSakId,
      lineStyle: {
        width: 2,
        opacity: 0.7,
        type: 'solid'
      }
    });
  });

  // Build adjacency list for search and hover highlighting
  const adjacencyList = buildAdjacencyList(links);
  
  // Determine final visibility
  const visibleNodeIds = new Set<string>();
  const dimmedNodeIds = new Set<string>();
  
  if (hasSearchFilter && searchMatchingIds.size > 0) {
    // If searching, show search matches AND their connected nodes
    const connectedToSearch = new Set<string>();
    
    searchMatchingIds.forEach(nodeId => {
      connectedToSearch.add(nodeId);
      const neighbors = adjacencyList.get(nodeId) || new Set();
      neighbors.forEach(neighbor => connectedToSearch.add(neighbor));
    });
    
    nodes.forEach(node => {
      const passesFilters = node._shouldShow;
      const isConnectedToSearch = connectedToSearch.has(node.id);
      
      if (passesFilters && isConnectedToSearch) {
        visibleNodeIds.add(node.id);
      } else if (behavior === 'dim') {
        dimmedNodeIds.add(node.id);
        node.itemStyle = { opacity: effectiveDimOpacity.value };
        node.label = { show: false };
      }
    });
  } else {
    // No search filter - just use regular filter logic
    nodes.forEach(node => {
      if (node._shouldShow) {
        visibleNodeIds.add(node.id);
      } else if (behavior === 'dim') {
        dimmedNodeIds.add(node.id);
        node.itemStyle = { opacity: effectiveDimOpacity.value };
        node.label = { show: false };
      }
    });
  }
  
  // Filter links to only show those between visible/dimmed nodes
  const visibleLinks = links.filter(link => {
    const source = typeof link.source === 'string' ? link.source : link.source.id;
    const target = typeof link.target === 'string' ? link.target : link.target.id;
    return visibleNodeIds.has(source) || dimmedNodeIds.has(source) ||
           visibleNodeIds.has(target) || dimmedNodeIds.has(target);
  });
  
  // Apply hover dimming
  if (hoveredNodeId.value) {
    const connectedNodes = adjacencyList.get(hoveredNodeId.value) || new Set();
    connectedNodes.add(hoveredNodeId.value);
    
    nodes.forEach(node => {
      if (!connectedNodes.has(node.id)) {
        node.itemStyle = { ...node.itemStyle, opacity: hoverDimOpacity };
        node.label = { ...node.label, show: false };
      }
    });
    
    visibleLinks.forEach(link => {
      const source = typeof link.source === 'string' ? link.source : link.source.id;
      const target = typeof link.target === 'string' ? link.target : link.target.id;
      
      if (source !== hoveredNodeId.value && target !== hoveredNodeId.value) {
        link.lineStyle = { ...link.lineStyle, opacity: hoverDimOpacity };
      }
    });
  }
  
  // Clean up temporary properties
  nodes.forEach(node => {
    delete node._shouldShow;
    delete node._visibleRoles;
  });

  return {
    tooltip: {
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return params.data.name;
        }
        return `${params.data.source} → ${params.data.target}`;
      }
    },
    series: [{
      type: "graph",
      layout: "force",
      force: {
        repulsion: 800,
        gravity: 0.05,
        edgeLength: 150,
        layoutAnimation: true,
        friction: 0.6
      },
      symbolSize: 50,
      roam: true,
      label: {
        show: true,
        position: 'bottom',
        distance: 5,
        fontSize: 14
      },
      edgeSymbol: ['circle', 'arrow'],
      edgeSymbolSize: [4, 10],
      data: nodes.filter(n => visibleNodeIds.has(n.id) || dimmedNodeIds.has(n.id)),
      links: visibleLinks,
      lineStyle: {
        opacity: 0.9,
        width: 2,
        curveness: 0.2
      },
      categories: [
        { name: 'location' },
        { name: 'person' },
        { name: 'swarm' }
      ]
    }]
  };
});
</script>
