# MusicGPT: AI Music Generation Platform

## Project Overview

Application simulates AI music generation from text prompts. Users enter a prompt, and the app generates two versions of music with real-time progress tracking. Features include a built-in music player, animated progress indicators, and WebSocket-based updates for live generation status.

## Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/asmitrajbhandari/musicgpt
   cd musicgpt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Socket.IO server dependencies**
   ```bash
   cd socket-server
   npm install
   cd ..
   ```

4. **Run the development servers**

   Terminal 1: Next.js App:
   ```bash
   npm run dev
   ```

   Terminal 2: Socket.IO Server:
   ```bash
   cd socket-server
   npm start
   ```

5. **Open the application**
   - Navigate to http://localhost:3000
   - Socket.IO server runs on http://localhost:3001

## Project Structure

```
nextjs-tailwind-app/
├── app/
│   ├── api/
│   │   └── create-song/
│   │       └── route.ts              # API route for song creation
│   ├── components/
│   │   ├── ui/
│   │   │   ├── circle-button.tsx     # Reusable circular button component
│   │   │   └── rounded-button.tsx    # Reusable rounded button component
│   │   ├── Footer.tsx                # Footer with navigation links
│   │   ├── Header.tsx                # Header with navigation
│   │   ├── LocaleSelector.tsx        # Language selector component
│   │   ├── MusicList.tsx             # Music item display with animations
│   │   ├── Profile.tsx               # User profile dropdown
│   │   └── Sidebar.tsx               # Navigation sidebar
│   ├── create/
│   │   └── page.tsx                  # Main music creation page
│   ├── utils/
│   │   ├── gptConstants.ts           # Centralized constants (no magic strings)
│   │   ├── navigation.ts             # Navigation menu configuration & icons
│   │   └── pageTitles.ts             # Dynamic page title updates
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Home page
│   └── musicgpt.scss                 # Custom SCSS styles and animations
├── lib/
│   ├── utils/
│   │   ├── promptValidator.ts        # Prompt validation logic
│   │   └── titleGenerator.ts         # Random title generation
│   ├── server-socket.ts              # Server-side socket utilities
│   └── socket.ts                     # Client-side Socket.IO service
├── stores/
│   ├── songStore.ts                  # Zustand store for music items
│   ├── warningStore.ts               # Zustand store for warnings
│   └── invalidPromptStore.ts         # Zustand store for invalid prompts
├── socket-server/
│   ├── server.js                     # Socket.IO server with HTTP endpoint
│   └── package.json                  # Server dependencies
└── public/
    └── assets/
        ├── images/                   # Background images
        └── svg/                      # Icon assets
```

### Key Organization Principles

No Magic Strings:
- All text content centralized in `app/utils/gptConstants.ts`
- Organized by sections: FOOTER, CREATE_PAGE, PROFILE, ERROR_CONSTANTS
- Easy to update and maintain across the application

Navigation Management:
- `app/utils/navigation.ts` - All navigation menu items and icon configurations
- Centralized navigation structure for Header, Sidebar, and Footer

Page Titles:
- `app/utils/pageTitles.ts` - Dynamic page title management
- Consistent title updates across routes

Custom Styling:
- `app/musicgpt.scss` - All custom CSS, animations, and SCSS variables
- Complex animations (neon glow, shimmer effects, wiggle)
- Global styles and resets

## Reusable Component Architecture

### 1. **CircleButton Component**

**Location:** `app/components/ui/circle-button.tsx`

A versatile circular button with configurable opacity and click handlers.

**Features:**
- Dynamic icon opacity (configurable via props)
- Hover state with background transition
- Active scale animation on click
- Fully typed with TypeScript
- Accepts custom click handlers
- SVG icon support

### 2. RoundedButton Component

**Location:** `app/components/ui/rounded-button.tsx`

Toggle-able button with active states.

**Features:**
- Active/inactive states with different styling
- Icon swapping on active state (different icons for active/inactive)
- Customizable text styling via className prop
- Smooth transitions between states
- Configurable icon opacity
- TypeScript typed props

### 3. MusicList Component

**Location:** `app/components/MusicList.tsx`

Complex component displaying music generation items with:
- Progress tracking with animated percentage
- Rotating light effect during generation
- Pulsing completion indicator
- Dynamic text transitions with AnimatePresence
- Conditional hover actions (only for completed items)
- Status-based rendering (different UI for generating vs completed)
- Random background images (1-4)
- Version display (v1, v2)
- Action buttons (ThumbsUp, ThumbsDown) on hover

## Complete Song Generation Flow

### End-to-End Architecture Overview

1. User Interaction Layer
   1.1 User types prompt
   1.2 Clicks submit button
   1.3 handleSubmit() triggered

2. Client State Layer (Zustand)
   2.1 Creates 2 music items (v1, v2) with unique IDs
   2.2 Sets status: 'pending', progress: 0
   2.3 Adds to musicItems array in songStore

3. Next.js API Route Layer
   3.1 POST /api/create-song
   3.2 Validates prompt
   3.3 Forwards request via HTTP POST to Socket.IO server

4. Socket.IO Server (Port 3001)
   4.1 HTTP Endpoint: POST /create-song
   4.2 Receives prompt + itemIds [id1, id2]
   4.3 Spawns 2 parallel progress simulations:
       - Item 1 (v1): 50ms intervals, completes in ~5 seconds
       - Item 2 (v2): 80ms intervals, completes in ~8 seconds
   4.4 Broadcasts progress via WebSocket: io.emit('song-progress', data)

5. WebSocket Broadcast Layer
   5.1 Event: 'song-progress'
   5.2 Payload: { id, progress, status, prompt }
   5.3 Sent every interval (50ms/80ms) for each item
   5.4 Progress: 0% to 100%
   5.5 Status: 'generating' to 'completed'

6. Client Socket Listener
   6.1 lib/socket.ts - Event: 'song-progress'
   6.2 Receives progress updates
   6.3 Maps progress % to dynamic text (0-20%: "Starting AI engine...")
   6.4 Calls useSongStore.updateMusicItem(id, { progress, status, text })

7. UI Update Layer (React)
   7.1 Zustand triggers re-render
   7.2 MusicList component shows updated progress
   7.3 Animations: rotating light, shimmer text, progress bar
   7.4 On completion: pulsing indicator, action buttons appear

## Detailed Step-by-Step Flow

### Step 1: User Submits Prompt

**Location:** `app/create/page.tsx` (handleSubmit function)

**Process:**
1. Generate unique IDs for v1 and v2 using timestamp + random number
2. Generate random image numbers (1-4) for background images
3. Add both items to Zustand store (optimistic update)
4. Call Next.js API route with POST request
5. Clear input field

**State Changes:**
- `musicItems` array grows by 2
- Each item has `status: 'pending'`, `progress: 0`
- UI immediately shows pending items

### Step 2: Next.js API Route Processing

**Location:** `app/api/create-song/route.ts`

**Process:**
1. Parse request body to extract prompt and itemIds
2. Validate prompt (non-empty, valid string)
3. Forward to Socket.IO server via HTTP POST to localhost:3001
4. Return success response to client

Why HTTP POST to Socket Server?
- Next.js API routes are serverless and stateless
- Cannot maintain long-running processes
- Socket.IO server handles persistent connections and progress simulation
- Separates concerns: Next.js for routing, Socket.IO for real-time updates

### Step 3: Socket.IO Server Processing

**Location:** `socket-server/server.js`

**Process:**
1. HTTP endpoint receives request with prompt and itemIds
2. Validate request (prompt exists, itemIds array has 2 items)
3. Immediately respond to HTTP request (non-blocking)
4. Start parallel progress simulations for both items

**Item 1 (v1) - Faster Progression:**
- 50ms intervals between progress updates
- Completes in ~5 seconds (100 updates × 50ms)
- Broadcasts progress via WebSocket after each update

**Item 2 (v2) - Slower Progression:**
- 80ms intervals between progress updates
- Completes in ~8 seconds (100 updates × 80ms)
- Broadcasts progress via WebSocket after each update

**Key Points:**
- Two independent progress simulations running at different speeds
- Real-time broadcasting via `io.emit()` to all connected clients
- Non-blocking - HTTP response sent immediately, processing continues
- Progress: 0% to 100% in increments of 1%

### Step 4: Client Receives WebSocket Updates

**Location:** `lib/socket.ts`

**Process:**
1. Socket listener receives 'song-progress' event with data (id, progress, status, prompt)
2. Map progress percentage to dynamic text:
   - 0-20%: "Starting AI and v engine."
   - 21-40%: "Initializing sound"
   - 41-60%: "Initializing sound model"
   - 61-80%: "Generating audio"
   - 81-99%: "Finalizing"
   - 100%: "Complete"
3. Find the music item in Zustand store by ID
4. Update the item with new progress, status, and text
5. Generate random title on completion

**State Updates:**
- `progress`: 0 to 1 to 2 to ... to 100
- `status`: 'pending' to 'generating' to 'completed'
- `progressText`: Dynamic text based on progress range
- `title`: Generated on completion using titleGenerator utility

### Step 5: UI Rendering & Animations

**Location:** `app/components/MusicList.tsx`

The component subscribes to Zustand store and re-renders on state changes.

**Generating State UI:**
- Rotating light animation (360° continuous rotation)
- Shimmer text effect on prompt text
- Animated progress text with smooth transitions
- Progress percentage display
- Background image based on imageNumber

**Completed State UI:**
- Pulsing completion indicator (expanding ring effect)
- Action buttons (ThumbsUp, ThumbsDown) visible on hover
- Generated title display
- Version badge (v1 or v2)
- Static background image

**Re-render Triggers:**
- Progress updates (every 50ms or 80ms)
- Status changes (pending to generating to completed)
- Progress text changes (based on percentage ranges)

## State Management Architecture

### 1. Song Store (Primary State)

**Location:** `stores/songStore.ts`

**MusicItem Interface:**
- `id`: Unique identifier (timestamp + random)
- `title`: Generated on completion using titleGenerator
- `prompt`: User's input text
- `status`: 'idle' | 'pending' | 'generating' | 'completed' | 'failed'
- `progress`: 0-100 percentage
- `progressText`: Dynamic text based on progress range
- `version`: 'v1' or 'v2'
- `imageNumber`: 1-4 for background image selection
- `result`: Future field for actual audio data
- `error`: Error message if generation fails

**Store Actions:**
- `addMusicItem`: Add new item to array
- `updateMusicItem`: Update specific item by ID with partial updates
- `removeMusicItem`: Remove item from array by ID
- `reset`: Clear all items

**State Lifecycle:**

1. Creation (handleSubmit)
   - { id: '1234567890123', status: 'pending', progress: 0, ... }

2. First Update (WebSocket)
   - { id: '1234567890123', status: 'generating', progress: 1, ... }

3. Progress Updates (WebSocket, every 50ms/80ms)
   - { id: '1234567890123', status: 'generating', progress: 45, progressText: 'Initializing sound model' }

4. Completion (WebSocket)
   - { id: '1234567890123', status: 'completed', progress: 100, title: 'Mystic Melody', progressText: 'Complete' }

### 2. Warning Store (Server Capacity)

**Location:** `stores/warningStore.ts`

**Store State:**
- `showServerBusyWarning`: Boolean flag for server capacity warning
- `setShowServerBusyWarning`: Setter function

**Logic:** `app/create/page.tsx`
- useEffect monitors musicItems array
- Counts items with status 'generating' or 'pending'
- Shows warning if count >= 4
- Disables submit button when warning is active
- Shared across Create page and Profile dropdown

**Impact:**
- Disables submit button when `showServerBusyWarning === true`
- Shows warning message in UI
- Shared across Create page and Profile dropdown

### 3. Invalid Prompt Store

**Location:** `stores/invalidPromptStore.ts`

**Store State:**
- `invalidPrompts`: Array of invalid prompt strings
- `addInvalidPrompt`: Add prompt to invalid list
- `clearInvalidPrompts`: Clear all invalid prompts

**Usage:**
- Stores prompts that fail validation (using promptValidator utility)
- Prevents invalid items from cluttering music list
- Displays in separate "Invalid Prompts" section with error styling
- Independent from musicItems array

## Real-Time Communication Architecture

### WebSocket Connection Lifecycle

1. App Initialization
   - socketService.connect() called in useEffect

2. Connection Established
   - socket.on('connect') sets up event listeners

3. Listening for Events
   - socket.on('song-progress') updates Zustand store

4. Automatic Reconnection
   - On disconnect, retry with exponential backoff (max 5 attempts)

### Client-Side Socket Service

**Location:** `lib/socket.ts`

Singleton pattern ensures single WebSocket connection.

**Features:**
- Automatic reconnection with exponential backoff
- Multiple transport fallbacks (WebSocket to Polling)
- Connection state tracking
- Error handling and retry logic (max 5 attempts)
- Event listeners for connect, disconnect, connect_error, song-progress
- Connects to localhost:3001
- Reconnection delay: 1000ms to 5000ms

### Socket.IO Server Architecture

**Location:** `socket-server/server.js`

Hybrid HTTP + WebSocket server.

**Architecture:**
- Express.js for HTTP endpoints
- Socket.IO for WebSocket communication
- CORS configured for localhost:3000
- Listens on port 3001

**Why This Architecture?**
- **HTTP endpoint** for stateless request handling
- **WebSocket** for real-time bidirectional communication
- **Broadcast capability** (`io.emit`) to update all connected clients
- **Independent from Next.js** for long-running processes
- **Persistent connections** for progress tracking

## State Synchronization Flow

1. Zustand Store (Single Source of Truth)
   - Maintains musicItems array with all music generation items
   - Each item contains: id, status, progress, prompt, title, etc.
   - Example states: completed (100%), generating (45%), pending (0%)

2. Component Subscriptions
   - Create Page subscribes to musicItems
   - Profile Dropdown subscribes to musicItems
   - MusicList Component subscribes to individual items

3. WebSocket Updates
   - Socket service receives progress updates
   - Updates flow through Zustand store
   - All subscribed components automatically re-render

Benefits:
- Single source of truth - All components read from same store
- Automatic UI updates - Zustand triggers re-renders
- Optimistic updates - Items added immediately, updated via WebSocket
- Selective subscriptions - Components only re-render when relevant data changes


