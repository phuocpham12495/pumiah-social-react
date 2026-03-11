# Technical Specification: Antigravity Social App (ReactJS + Supabase)

## 1. Introduction

This document outlines the technical architecture, technology stack, and implementation details for building a simple social networking application named "Antigravity". The application aims to provide a lightweight platform for users to connect with friends, share updates, and interact with content, focusing on core functionalities without the complexities of modern social networks. The frontend will be developed using ReactJS, and the backend will be powered by Supabase.

## 2. Architecture Overview

The application will follow a client-server architecture:

*   **Frontend (Client-Side)**: A Single Page Application (SPA) built with ReactJS, responsible for rendering the user interface, handling user interactions, and communicating with the Supabase backend.
*   **Backend (Serverless/BaaS)**: Supabase will serve as the backend-as-a-service (BaaS), providing:
    *   **PostgreSQL Database**: For data storage.
    *   **Authentication**: User management, sign-up, login, sessions.
    *   **Realtime**: Instant updates for feeds, comments, and notifications.
    *   **Storage**: For user-uploaded files (profile pictures, post images).
    *   **Edge Functions**: (Optional for MVP, can be introduced for complex server-side logic if needed).

```mermaid
graph TD
    User --- Browser
    Browser -- HTTP/S (REST/GraphQL) --> SupabaseAPI(Supabase API)
    SupabaseAPI -- Auth --> SupabaseAuth(Supabase Auth)
    SupabaseAPI -- Database Queries (SQL/PostgREST) --> PostgreSQL(Supabase PostgreSQL DB)
    SupabaseAPI -- File Upload/Download --> SupabaseStorage(Supabase Storage)
    SupabaseAPI -- Realtime Subscriptions --> SupabaseRealtime(Supabase Realtime)
    SupabaseAPI -- RLS --> RLS(Row Level Security)
    SupabaseAPI -- Hooks/Triggers --> SupabaseFunctions(Supabase Edge Functions / DB Functions)

    subgraph Frontend (ReactJS)
        ReactUI[React UI Components]
        StateManagement[State Management]
        SupabaseClient[Supabase JS Client]
        Routing[React Router]
        PWA[Service Worker/Manifest]
    end

    Browser --- ReactUI
    ReactUI --- SupabaseClient
    SupabaseClient --- SupabaseAPI
```

## 3. Frontend Technical Specifications (ReactJS)

### 3.1. Core Framework & Libraries

*   **ReactJS**: The primary JavaScript library for building the user interface.
*   **React Router**: For client-side routing and navigation between different views (e.g., `/feed`, `/profile/:id`, `/settings`).
*   **Supabase JS Client**: The official JavaScript client library for interacting with the Supabase backend (authentication, database queries, storage uploads, realtime subscriptions).

### 3.2. State Management

For managing application-wide state (e.g., authenticated user, friend requests, notifications):
*   **React Context API**: For simpler, localized state management and passing props down the component tree.
*   **Zustand/Jotai (Optional)**: For more robust global state management if the application complexity grows, offering a lightweight and performant alternative to Redux. For MVP, Context API with `useState`/`useReducer` might suffice.

### 3.3. UI & Styling

*   **Styling Framework**:
    *   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in JSX. This approach supports a "Mobile First" philosophy by default.
    *   **Alternatively, CSS Modules or Styled Components**: For component-scoped styling, providing modularity and avoiding global CSS conflicts.
*   **Icon Library**: React Icons or similar for common UI elements (e.g., like, comment, send, add friend).

### 3.4. Component Structure

A modular component-based architecture will be adopted, with clear separation of concerns:
*   `components/`: Reusable UI elements (buttons, inputs, cards).
*   `pages/`: Top-level components representing distinct views (e.g., `HomePage.js`, `ProfilePage.js`, `SettingsPage.js`).
*   `features/`: Grouping components and logic related to a specific feature (e.g., `Auth/`, `Posts/`, `Friends/`).

### 3.5. Responsive Web Design (RWD)

*   **Mobile-First Approach**: Development will prioritize mobile layouts and progressively enhance for larger screens using CSS media queries.
*   **Flexible Layouts**: Utilization of CSS Grid and Flexbox for fluid and adaptive layouts that resize gracefully across various screen sizes.
*   **Viewport Meta Tag**: Ensure `width=device-width, initial-scale=1` is correctly set in `index.html`.
*   **Image Optimization**: Use responsive images (`<img srcset="..." sizes="...">`) and optimize image sizes for faster loading on all devices. Supabase Storage can integrate with image transformation services if needed in the future.

### 3.6. Progressive Web App (PWA) Capabilities

*   **Web App Manifest (`manifest.json`)**:
    *   Configuration for app name, icons, start URL, display mode (standalone), theme color, background color.
    *   Enables "Add to Home Screen" functionality.
*   **Service Worker**:
    *   **Caching Strategy**: Implement a service worker using Workbox (recommended for ease of use) or manually for:
        *   **App Shell Caching**: Cache static assets (JS, CSS, HTML, images) for instant loading on repeat visits and offline access.
        *   **Dynamic Content Caching**: Cache recent posts, profiles, and other user data (e.g., "stale-while-revalidate" strategy) to provide an offline experience for previously viewed content.
    *   **Offline Mode**: The service worker will intercept network requests and serve cached content when offline.
*   **Push Notifications (Future Consideration)**: While the current notification system is in-app, PWA push notifications (Web Push API) could be integrated for out-of-app alerts for likes, comments, and friend requests. This would require a server-side component (e.g., Supabase Edge Function or external service) to manage push subscriptions and send notifications.

## 4. Backend Technical Specifications (Supabase)

### 4.1. Database Schema (PostgreSQL)

All tables will have `id` (UUID, primary key, default `gen_random_uuid()`) and `created_at` (timestamp with time zone, default `now()`).

*   **`profiles` Table**: Stores user-specific public information.
    *   `id`: `UUID` (PK, references `auth.users.id` via RLS).
    *   `username`: `TEXT` (Unique, for display, e.g., `@johndoe`).
    *   `full_name`: `TEXT`.
    *   `bio`: `TEXT`.
    *   `profile_photo_url`: `TEXT` (URL to Supabase Storage).
    *   `cover_photo_url`: `TEXT` (Optional, URL to Supabase Storage).
    *   `location`: `TEXT` (Optional).
    *   `date_of_birth`: `DATE` (Optional, for profile settings).
*   **`friend_requests` Table**: Manages pending friend requests.
    *   `sender_id`: `UUID` (FK to `profiles.id`).
    *   `receiver_id`: `UUID` (FK to `profiles.id`).
    *   `status`: `TEXT` (`'pending'`, `'accepted'`, `'declined'`).
    *   `CONSTRAINT unique_request UNIQUE (sender_id, receiver_id)`
*   **`friendships` Table**: Stores established connections.
    *   `user1_id`: `UUID` (FK to `profiles.id`).
    *   `user2_id`: `UUID` (FK to `profiles.id`).
    *   `CONSTRAINT unique_friendship UNIQUE (user1_id, user2_id)` (ensure canonical order `user1_id < user2_id` if needed).
*   **`posts` Table**: Stores user-created content.
    *   `profile_id`: `UUID` (FK to `profiles.id`).
    *   `post_type`: `TEXT` (`'text'`, `'image'`, `'link'`).
    *   `content`: `TEXT` (Main text content).
    *   `media_url`: `TEXT` (URL to image in Supabase Storage, for 'image' type).
    *   `link_url`: `TEXT` (URL for 'link' type).
*   **`comments` Table**: Stores comments on posts.
    *   `post_id`: `UUID` (FK to `posts.id`).
    *   `profile_id`: `UUID` (FK to `profiles.id`).
    *   `content`: `TEXT`.
*   **`likes` Table**: Stores likes on posts and comments.
    *   `profile_id`: `UUID` (FK to `profiles.id`).
    *   `target_id`: `UUID` (References `posts.id` or `comments.id`).
    *   `target_type`: `TEXT` (`'post'`, `'comment'`).
    *   `CONSTRAINT unique_like UNIQUE (profile_id, target_id, target_type)`
*   **`notifications` Table**: Stores activity alerts.
    *   `recipient_id`: `UUID` (FK to `profiles.id`).
    *   `sender_id`: `UUID` (FK to `profiles.id`, optional, e.g., for friend requests).
    *   `type`: `TEXT` (`'like_post'`, `'comment_post'`, `'friend_request_received'`, `'friend_request_accepted'`).
    *   `message`: `TEXT` (e.g., "John Doe liked your post").
    *   `target_url`: `TEXT` (URL to the relevant post/profile).
    *   `is_read`: `BOOLEAN` (Default `FALSE`).

### 4.2. Authentication (Supabase Auth)

*   **Email/Password Authentication**: Supabase Auth will handle user registration, login, password resets, and email confirmation.
*   **JSON Web Tokens (JWTs)**: Supabase issues JWTs upon successful login, which are automatically managed by the Supabase JS client for authenticated requests.
*   **User Management**: `auth.users` table for core user data. A `profiles` table will be linked to `auth.users` via a one-to-one relationship using a trigger or direct RLS policy for initial profile creation upon sign-up.

### 4.3. Row Level Security (RLS)

Crucial for securing data in PostgreSQL:

*   **`profiles`**:
    *   `SELECT`: All authenticated users can view profiles.
    *   `INSERT`: Users can create their own profile (typically upon first login after sign-up).
    *   `UPDATE`: Users can only update their own profile (`auth.uid() = id`).
    *   `DELETE`: Denied (or only by admin).
*   **`friend_requests`**:
    *   `SELECT`: User can select requests where `sender_id = auth.uid()` or `receiver_id = auth.uid()`.
    *   `INSERT`: User can insert requests where `sender_id = auth.uid()`.
    *   `UPDATE`: User can update requests where `receiver_id = auth.uid()` (e.g., to accept/decline).
*   **`friendships`**:
    *   `SELECT`: User can select friendships where `user1_id = auth.uid()` or `user2_id = auth.uid()`.
    *   `INSERT`: Only via trigger/function upon accepting a friend request.
    *   `DELETE`: User can delete friendships where `user1_id = auth.uid()` or `user2_id = auth.uid()`.
*   **`posts`**:
    *   `SELECT`: Users can view posts from their `profile_id` or from their friends' `profile_id` (requires complex RLS policy using a join with `friendships` table).
    *   `INSERT`: Users can only insert posts with their own `profile_id`.
    *   `UPDATE`: Users can only update their own posts.
    *   `DELETE`: Users can only delete their own posts.
*   **`comments`**:
    *   `SELECT`: All authenticated users can view comments on posts they can view.
    *   `INSERT`: Users can only insert comments with their own `profile_id` on visible posts.
    *   `UPDATE`: Denied.
    *   `DELETE`: Users can only delete their own comments.
*   **`likes`**:
    *   `SELECT`: All authenticated users can view likes on visible posts/comments.
    *   `INSERT`: Users can only insert likes with their own `profile_id`.
    *   `DELETE`: Users can only delete their own likes.
*   **`notifications`**:
    *   `SELECT`: Users can only view notifications where `recipient_id = auth.uid()`.
    *   `INSERT`: Only via database triggers or Edge Functions/RPC for system-generated notifications.
    *   `UPDATE`: Users can update `is_read` status for their own notifications.

### 4.4. Supabase Storage

*   **Buckets**: Create separate storage buckets for `profile_photos` and `post_images`.
*   **Policy**: Implement RLS-like policies for storage buckets to control who can upload, view, and delete files.
    *   Users can upload to their designated folder (e.g., `user_id/profile.jpg`).
    *   All authenticated users can view public profile photos and post images.

### 4.5. Supabase Realtime

*   **Channels**: Subscribe to database changes for instant updates.
    *   **Public Channel**: For new posts appearing in the feed.
    *   **Private Channel (User-specific)**: For direct notifications (new friend requests, likes, comments on user's posts) or friend status updates.
*   **Use Cases**:
    *   Live updates on post feeds as friends publish new content.
    *   Instant display of new comments or likes on a post.
    *   Real-time notifications for friend requests, likes, and comments.

### 4.6. Database Triggers & Functions (Optional but Recommended)

*   **`on_auth_user_created`**: A PostgreSQL trigger function to automatically create a corresponding `profile` entry in the `profiles` table when a new user signs up in `auth.users`.
*   **`on_friend_request_accepted`**: A function/trigger that creates an entry in `friendships` and possibly a `notification` when a `friend_requests` entry is updated to `'accepted'`.
*   **Notification Generation**: Triggers on `posts`, `comments`, `likes`, and `friend_requests` tables to automatically insert records into the `notifications` table.

## 5. API Key Security

*   **Supabase Project API Key (Public/`anon` key)**:
    *   This key is safe to use on the client-side (ReactJS app) as it only grants access according to defined Row Level Security policies.
    *   It should be stored in environment variables (e.g., `.env.local` for development, configured variables in CI/CD for production) and accessed via `process.env.REACT_APP_SUPABASE_ANON_KEY`.
    *   **Never hardcode** this key directly in the codebase that will be pushed to a public repository.
*   **Supabase Service Role Key (Secret)**:
    *   This key bypasses all Row Level Security and should **never** be exposed client-side or pushed to GitHub.
    *   It is intended for server-side operations (e.g., custom backend functions, secure data migrations, admin scripts).
    *   If using Supabase Edge Functions for certain server-side logic, the Service Role Key would be securely injected as an environment variable into the Edge Function environment.

## 6. Development & Deployment

*   **Local Development**:
    *   `create-react-app` or Vite for React project scaffolding.
    *   Supabase CLI for local Supabase project setup (migrations, seeding, mock API).
    *   Environment variables loaded via `.env` files.
*   **Version Control**: Git and GitHub for source code management. Adherence to GitFlow or similar branching strategies.
*   **Frontend Deployment**:
    *   **Platform**: Vercel or Netlify are excellent choices for deploying React SPAs. They offer seamless integration with GitHub repositories, automatic builds, and CDN distribution.
    *   **Environment Variables**: Securely configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables within the deployment platform.
*   **Backend Deployment**: Supabase manages its own backend deployment and hosting automatically. Database schema changes will be managed via Supabase migrations.

## 7. Future Considerations / Scalability

*   **Analytics**: Integrate analytics tools (e.g., Google Analytics, PostHog) to monitor user engagement.
*   **Search Functionality**: Implement search for users and posts using PostgreSQL FTS (Full Text Search) or external services like Algolia.
*   **Direct Messaging**: Introduce a real-time direct messaging feature using Supabase Realtime.
*   **Media Embeds**: Support for embedding videos from YouTube/Vimeo.
*   **Moderation Tools**: For managing inappropriate content or users.
*   **Edge Functions**: For more complex server-side logic that cannot be handled efficiently by RLS or database functions, Edge Functions can provide custom API endpoints.

This technical specification provides a detailed roadmap for implementing the Antigravity social application, focusing on a robust and scalable architecture using ReactJS and Supabase.
