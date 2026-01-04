# BeReal Clone - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        React Native App                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Screens    │  │  Components  │  │  Navigation  │      │
│  │              │  │              │  │              │      │
│  │ - Feed       │  │ - PostCard   │  │ - AuthStack  │      │
│  │ - Camera     │  │ - Button     │  │ - MainTabs   │      │
│  │ - Friends    │  │ - Input      │  │ - AppNav     │      │
│  │ - Profile    │  │ - Timer      │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └────────┬────────┴─────────────────┘               │
│                  │                                           │
│         ┌────────▼────────┐                                 │
│         │  Zustand Store  │                                 │
│         │                 │                                 │
│         │ - User State    │                                 │
│         │ - Post State    │                                 │
│         │ - Friend State  │                                 │
│         └────────┬────────┘                                 │
│                  │                                           │
│         ┌────────▼────────┐                                 │
│         │   API Layer     │                                 │
│         │                 │                                 │
│         │ - auth.ts       │                                 │
│         │ - posts.ts      │                                 │
│         │ - friends.ts    │                                 │
│         │ - reactions.ts  │                                 │
│         └────────┬────────┘                                 │
│                  │                                           │
└──────────────────┼───────────────────────────────────────────┘
                   │
                   │ HTTP/REST
                   │
         ┌─────────▼──────────┐
         │                    │
         │     Supabase       │
         │                    │
         ├────────────────────┤
         │                    │
         │  PostgreSQL DB     │
         │  - users           │
         │  - posts           │
         │  - friendships     │
         │  - reactions       │
         │                    │
         ├────────────────────┤
         │                    │
         │  Storage           │
         │  - posts/          │
         │  - reactions/      │
         │  - profiles/       │
         │                    │
         ├────────────────────┤
         │                    │
         │  Auth              │
         │  - JWT tokens      │
         │  - Session mgmt    │
         │                    │
         └────────────────────┘
```

## Layer Architecture

### Presentation Layer (Screens + Components)

**Responsibility**: User interface and user interactions

**Screens** (`src/screens/`):
- Each screen is a full-page component
- Manages local UI state
- Calls hooks and API functions
- Handles navigation

**Components** (`src/components/`):
- Reusable UI building blocks
- Receive props, render UI
- Minimal business logic
- Styled with TailwindCSS (NativeWind)

**Design Principles**:
- Single Responsibility: Each component does one thing
- Composition: Complex UIs built from simple components
- Props-driven: Data flows down via props
- Event handling: Events bubble up via callbacks

### State Management Layer (Zustand)

**Responsibility**: Global application state

```typescript
Store Structure:
{
  user: User | null,              // Current logged-in user
  hasPostedToday: boolean,        // Post status flag
  todaysMomentTime: Date | null,  // Notification time
  feedPosts: Post[],              // Today's posts
  friends: User[],                // Friends list
  friendRequests: Friendship[],   // Pending requests
  frontPhoto: string | null,      // Temp photo storage
  backPhoto: string | null,       // Temp photo storage
  myPostHistory: Post[],          // User's 14-day history
}
```

**Why Zustand**:
- Lightweight (1KB)
- Simple API
- No providers needed
- TypeScript-first
- React hooks integration

**State Flow**:
1. User action triggers function
2. Function updates Zustand store
3. Components subscribed to state re-render
4. UI updates automatically

### Business Logic Layer (API + Services)

**Responsibility**: Data operations and external integrations

**API Layer** (`src/api/`):
- Abstracted Supabase calls
- Error handling
- Data transformation
- Type-safe operations

**Services** (`src/services/`):
- External service integrations
- Supabase client configuration
- Notification service
- Image processing

**Design Principles**:
- Separation of Concerns: API calls isolated from UI
- Error Handling: Try-catch blocks, error returns
- Type Safety: TypeScript interfaces for all data
- Testability: Pure functions, mockable

### Data Layer (Supabase)

**Responsibility**: Data persistence and backend logic

**Database**:
- PostgreSQL with Row Level Security
- Real-time subscriptions (optional)
- Automatic indexes
- Foreign key constraints

**Storage**:
- CDN-backed image storage
- Public bucket access
- Automatic URL generation
- Built-in optimization

**Auth**:
- JWT-based authentication
- Automatic token refresh
- Session management
- Password hashing

## Data Flow Patterns

### 1. Authentication Flow

```
User Input → LoginScreen
           → signIn() API call
           → Supabase Auth
           → User object returned
           → setUser() in Zustand
           → Navigate to Main App
```

### 2. Post Creation Flow

```
User Action → Open Camera
           → Capture Back Photo
           → Store in state (setBackPhoto)
           → Capture Front Photo
           → Store in state (setFrontPhoto)
           → Review & Confirm
           → createPost() API call
           → Upload images to Storage
           → Insert post record to DB
           → setHasPostedToday(true)
           → Navigate to Feed
           → Feed loads posts
```

### 3. Feed Loading Flow

```
Feed Screen Mount → Check hasPostedToday
                 → If false: Show camera prompt
                 → If true: Load posts
                 → getTodaysPosts() API call
                 → Query DB for friends' posts
                 → Filter by date
                 → Return posts with user data
                 → setFeedPosts() in store
                 → Render post cards
```

### 4. Friend Request Flow

```
User A: Search → searchUsers() API
             → Display results
             → Click "Add"
             → sendFriendRequest()
             → Insert to friendships table
             
User B: App Launch → Load requests
                  → getFriendRequests()
                  → Display in Requests tab
                  → Click "Accept"
                  → acceptFriendRequest()
                  → Update status = 'accepted'
                  → Both users can now see posts
```

## Security Architecture

### Authentication Security

```
┌──────────────────┐
│  Client App      │
│                  │
│  1. Login        │──────┐
│     email/pass   │      │
└──────────────────┘      │
                          │
                    ┌─────▼────────┐
                    │  Supabase    │
                    │  Auth        │
                    │              │
                    │  2. Verify   │
                    │  3. Generate │
                    │     JWT      │
                    └─────┬────────┘
                          │
                    ┌─────▼────────┐
                    │  AsyncStorage│
                    │              │
                    │  4. Store    │
                    │     session  │
                    └──────────────┘
```

**Security Measures**:
- Passwords hashed with bcrypt
- JWT tokens for auth
- Tokens stored securely in AsyncStorage
- Auto token refresh
- HTTPS only communication

### Data Access Security

**Row Level Security (RLS)**:

```sql
-- Example: Users can only see friends' posts
CREATE POLICY "friends_posts" ON posts
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM friendships 
    WHERE (user_id = auth.uid() AND friend_id = posts.user_id AND status = 'accepted')
    OR (friend_id = auth.uid() AND user_id = posts.user_id AND status = 'accepted')
  )
);
```

**Access Control**:
- Database-level permissions
- Cannot bypass with API calls
- Automatic enforcement
- Prevents data leaks

## Performance Considerations

### Image Optimization

```
Original Photo
    ↓
Resize to 1080px width
    ↓
JPEG compression (80%)
    ↓
Upload to Supabase
    ↓
CDN serves optimized image
```

### Database Query Optimization

- **Indexes**: All foreign keys and frequent queries
- **Limiting**: Only fetch today's posts
- **Joining**: Fetch related data in single query
- **Caching**: Zustand stores data in memory

### React Native Performance

- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Load images on demand
- **FlatList**: Virtualized lists for large datasets
- **Native Navigation**: Use native transitions

## Scalability Considerations

### Current Architecture (MVP)

**Limitations**:
- Local notification scheduling
- Client-side image processing
- In-memory state (lost on app close)

### Production Scaling

**Backend Improvements**:
1. **Server-side Notifications**:
   - Cron job to schedule daily notifications
   - Push notification service (APNs/FCM)
   - Timezone-aware scheduling

2. **Image Processing**:
   - Server-side image optimization
   - Thumbnail generation
   - Progressive image loading

3. **Caching Layer**:
   - Redis for hot data
   - CloudFront/CDN for images
   - Query result caching

4. **Database Scaling**:
   - Read replicas
   - Partitioning by date
   - Archiving old posts

### Monitoring & Observability

**Recommended Tools**:
- Sentry: Error tracking
- Analytics: Mixpanel/Amplitude
- Performance: Firebase Performance
- Logs: CloudWatch/Datadog

## Testing Strategy

### Unit Tests
- Utility functions (date, image)
- API layer functions
- Zustand store actions

### Integration Tests
- API → Database flow
- Auth flow end-to-end
- Post creation flow

### E2E Tests
- User signup → post → view feed
- Friend request flow
- RealMoji reaction flow

### Testing Tools
- Jest: Unit testing
- React Native Testing Library: Component tests
- Detox: E2E testing

## Deployment Architecture

### Development
```
Local Machine → Expo Go App → Live Preview
```

### Staging
```
Code → EAS Build → TestFlight → QA Testing
```

### Production
```
Code → EAS Build → App Store Review → Production
```

## Technology Decisions

### Why React Native?
- Cross-platform code
- Large ecosystem
- Native performance
- Hot reload for development

### Why Expo?
- Simplified setup
- Built-in camera/notifications
- OTA updates
- EAS Build service

### Why Supabase?
- PostgreSQL (mature, reliable)
- Built-in auth
- Real-time capabilities
- Generous free tier
- Self-hostable

### Why Zustand?
- Minimal boilerplate
- TypeScript support
- No context providers
- Simple learning curve

### Why NativeWind?
- Tailwind familiar syntax
- Rapid UI development
- Consistent styling
- Responsive utilities

## Future Architecture Considerations

### Microservices
- Auth service
- Post service
- Notification service
- Friend service

### Message Queue
- RabbitMQ/SQS for async tasks
- Image processing queue
- Notification queue

### GraphQL
- Replace REST APIs
- Single endpoint
- Efficient data fetching
- Real-time subscriptions

---

**This architecture provides a solid foundation for a scalable, maintainable BeReal clone while keeping complexity manageable for an MVP.**

