import { parseYAML, stringifyYAML } from "confbox";

// ============================================================================
// Type Definitions
// ============================================================================

export interface Location {
  id: string;
  name: string;
  color: string;
  icon: string;
  url?: string;
}

export interface Person {
  id: string;
  name: string;
  location: string;
  color: string;
  icon: string;
  url?: string;
}

export interface Role {
  person: string;
  role: string;
}

export interface Swarm {
  id: string;
  name: string;
  color: string;
  icon: string;
  url?: string;
  roles: Role[];
}

export interface SvarmsData {
  locations: Location[];
  people: Person[];
  swarms: Swarm[];
}

export interface GraphFilters {
  nodeTypes?: ('location' | 'person' | 'swarm')[];
  locationIds?: string[];
  personIds?: string[];
  swarmIds?: string[];
  roleTypes?: string[];
  searchQuery?: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

function isValidLocation(obj: unknown): obj is Location {
  if (typeof obj !== "object" || obj === null) return false;
  const l = obj as Record<string, unknown>;
  return (
    typeof l.id === "string" &&
    typeof l.name === "string" &&
    typeof l.color === "string" &&
    typeof l.icon === "string" &&
    (l.url === undefined || typeof l.url === "string")
  );
}

function isValidPerson(obj: unknown): obj is Person {
  if (typeof obj !== "object" || obj === null) return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.location === "string" &&
    typeof p.color === "string" &&
    typeof p.icon === "string" &&
    (p.url === undefined || typeof p.url === "string")
  );
}

function isValidRole(obj: unknown): obj is Role {
  if (typeof obj !== "object" || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return typeof r.person === "string" && typeof r.role === "string";
}

function isValidSwarm(obj: unknown): obj is Swarm {
  if (typeof obj !== "object" || obj === null) return false;
  const s = obj as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.name === "string" &&
    typeof s.color === "string" &&
    typeof s.icon === "string" &&
    (s.url === undefined || typeof s.url === "string") &&
    Array.isArray(s.roles) &&
    s.roles.every(isValidRole)
  );
}

function validateSvarmsData(data: unknown): SvarmsData {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid svarms data: expected object");
  }

  const d = data as Record<string, unknown>;

  if (!Array.isArray(d.locations) || !d.locations.every(isValidLocation)) {
    throw new Error("Invalid svarms data: locations must be an array of Location objects");
  }

  if (!Array.isArray(d.people) || !d.people.every(isValidPerson)) {
    throw new Error("Invalid svarms data: people must be an array of Person objects");
  }

  if (!Array.isArray(d.swarms) || !d.swarms.every(isValidSwarm)) {
    throw new Error("Invalid svarms data: swarms must be an array of Swarm objects");
  }

  return d as unknown as SvarmsData;
}

// ============================================================================
// Read/Write Functions
// ============================================================================

/**
 * Parse YAML string to SvarmsData
 * @param yamlString - YAML formatted string
 * @returns Parsed and validated SvarmsData
 * @throws Error if parsing or validation fails
 */
export function read(yamlString: string): SvarmsData {
  try {
    const parsed = parseYAML(yamlString);
    return validateSvarmsData(parsed);
  } catch (error) {
    throw new Error(
      `Failed to parse svarms YAML: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Serialize SvarmsData to YAML string
 * @param data - The SvarmsData to serialize
 * @returns YAML formatted string
 * @throws Error if serialization fails
 */
export function write(data: SvarmsData): string {
  try {
    return stringifyYAML(data);
  } catch (error) {
    throw new Error(
      `Failed to stringify svarms to YAML: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function createEmpty(): SvarmsData {
  return {
    locations: [],
    people: [],
    swarms: [],
  };
}

export function getLocationById(data: SvarmsData, id: string): Location | undefined {
  return data.locations.find((loc) => loc.id === id);
}

export function getPersonById(data: SvarmsData, id: string): Person | undefined {
  return data.people.find((person) => person.id === id);
}

export function getSwarmById(data: SvarmsData, id: string): Swarm | undefined {
  return data.swarms.find((swarm) => swarm.id === id);
}

export function getPeopleAtLocation(data: SvarmsData, locationId: string): Person[] {
  return data.people.filter((person) => person.location === locationId);
}

export function getSwarmsForPerson(data: SvarmsData, personId: string): Swarm[] {
  return data.swarms.filter((swarm) =>
    swarm.roles.some((role) => role.person === personId)
  );
}

export function getPersonRoleInSwarm(swarm: Swarm, personId: string): string | undefined {
  const role = swarm.roles.find((r) => r.person === personId);
  return role?.role;
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  read,
  write,
  createEmpty,
  getLocationById,
  getPersonById,
  getSwarmById,
  getPeopleAtLocation,
  getSwarmsForPerson,
  getPersonRoleInSwarm,
};
