# Svarms

An interactive graph visualization tool for exploring organizational structures, relationships, and swarms (teams/groups). Built with Vue 3, TypeScript, and Vite.

## Features

- **Interactive Graph Visualization**: View locations, people, and swarms as an interconnected graph using D3.js force simulation
- **Dynamic Filtering**: Filter by node types, locations, people, swarms, roles, and search queries with URL-based persistence
- **Configurable Data**: Load different datasets via a simple JSON configuration file
- **Universal Color & Icon Support**:
  - Supports all 242+ Tailwind v4 colors dynamically (22 color families)
  - Supports all 1000+ Lucide icons dynamically
  - Zero maintenance - auto-updates with package versions
- **Share Functionality**: Copy filtered views to clipboard for easy sharing with visual feedback
- **YAML-Based Data**: Define your organizational structure in easy-to-read YAML format

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start dev server
pnpm run dev
```

Visit `http://localhost:5173` to see the application.

### Build

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Configuration

### Setting the Default Svarm File

Edit `/public/svarms.json` to specify which YAML file should be loaded by default:

```json
{
  "default": "/svarms/sak.yaml"
}
```

You can change the `default` value to point to any YAML file in the `/public` directory.

### YAML Data Format

Create YAML files in `/public/svarms/` with the following structure:

```yaml
locations:
  - id: location-1
    name: "Location Name"
    color: blue-500 # Any Tailwind color
    icon: factory # Any Lucide icon name
    url: "https://..." # Optional URL

people:
  - id: person-1
    name: "Person Name"
    location: location-1 # Reference to location ID
    color: sky-500
    icon: user-star
    url: "https://..." # Optional URL

swarms:
  - id: swarm-1
    name: "Swarm Name"
    color: emerald-500
    icon: users
    url: "https://..." # Optional URL
    roles:
      - person: person-1 # Reference to person ID
        role: leader # Role name (free text)
      - person: person-2
        role: member
```

#### Supported Colors

All Tailwind v4 colors are supported (242+ total):

- Color families: `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`
- Shades: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`

Example: `blue-500`, `emerald-700`, `rose-300`

#### Supported Icons

All Lucide icons are supported (1000+ total). See [lucide.dev/icons](https://lucide.dev/icons) for the complete list.

Popular icons: `user`, `user-star`, `users`, `factory`, `building`, `map-pin`, `briefcase`, `code`, etc.

## Features in Detail

### Graph Visualization

- **Force-directed layout**: Nodes are positioned using D3.js force simulation
- **Visual connections**: Lines show relationships between entities
- **Interactive**: Pan, zoom, and drag nodes
- **Responsive**: Adapts to window size changes

### Filtering

Access filters via the "Filters" button in the header. Supports:

- **Node Types**: Show/hide locations, people, or swarms
- **Locations**: Filter by specific locations
- **People**: Filter by specific people
- **Swarms**: Filter by specific swarms
- **Roles**: Filter by role types
- **Search**: Free-text search across all names
- **Behavior**: Choose how filtered nodes are displayed:
  - `hide`: Remove filtered nodes completely
  - `dim`: Show filtered nodes with reduced opacity
  - `show`: Show all nodes (no filtering)

All filter settings are saved to the URL for easy sharing.

### Share Feature

When filters are active, a "Share" button appears in the header:

1. Click the button to copy the current URL (including filters) to clipboard
2. Button shows "Copying..." during the operation
3. Button shows "Copied!" for 2 seconds after success
4. Button is disabled during copying to prevent double-clicks

## Project Structure

```
svarms/
├── public/
│   ├── svarms.json          # Configuration for default data file
│   └── svarms/
│       └── *.yaml           # YAML data files
├── src/
│   ├── components/
│   │   ├── Graph.vue        # Main graph visualization component
│   │   ├── Layout.vue       # App layout wrapper
│   │   └── ui/              # Reusable UI components
│   ├── lib/
│   │   ├── color-utils.ts   # Color resolution utilities
│   │   ├── lucide-helpers.ts # Icon loading utilities
│   │   └── svarms.ts        # YAML parsing and data types
│   ├── views/
│   │   ├── Viewer.vue       # Main viewer page
│   │   └── Editor.vue       # Editor page (if applicable)
│   └── styles/
│       └── globals.css      # Global styles + Tailwind config
└── package.json
```
