# AI Context: ForestPlus Frontend V1 (`forestPlus-FRONT`)

This document is the "Source of Truth" for AI agents and developers working on the `forestPlus-FRONT` legacy/maintenance project. It contains the essential knowledge to maintain consistency across the codebase.

## 1. Project Signature & Role
- **Core Role**: Original Angular application for ForestPlus.
- **Related Repo**: `forestPlus-BACK` (Primary API).
- **Communication Protocol**: HTTP (JSON), uses Bearer JWT for auth.

## 2. Technical Stack
- **Framework**: Angular 18+.
- **CSS Utility**: Tailwind CSS (Main styling system).
- **Icons**: FontAwesome 6.
- **Language**: TypeScript 5.
- **State**: RxJS (Observable-based state).
- **Build**: Vite / Angular CLI.

## 3. Directory Structure & Layers
```text
src/app/
├── api/          # Auto-generated OpenAPI models & classes
├── dashboard/    # Main application state/views
├── guards/       # AuthGuard and RoleGuard logic
├── interceptors/ # AuthInterceptor for JWT handling
├── models/       # Shared TS interfaces
├── pages/        # Public views (Login, Register)
├── services/     # Angular Services (Logic & API wrappers)
└── shared/       # Components (Modals, Headers, Inputs)
```

## 4. Key Implementation Patterns

### API Services (OpenAPI)
The project uses `openapitools.json` to generate an API client. Services act as thin wrappers around the generated controller services (`AuthControllerService`, `TreeControllerService`, etc.).
```typescript
@Injectable({ providedIn: 'root' })
export class TreeService {
  constructor(private treeApi: TreeControllerService) {}
  getAllTrees(): Observable<TreeResponseDto[]> {
    return this.treeApi.getAllTrees();
  }
}
```

### Styling: Tailwind CSS
Unlike V2, this repository relies heavily on **Tailwind CSS**. All styling should be done via utility classes within the HTML templates.
Example: `<div class="p-6 bg-white rounded-xl shadow-md flex items-center space-x-4">`

### Routing
Main configuration is in `app.routes.ts`. Dashboard uses child routing under the `DashboardComponent`.

## 5. Security & Authentication
- **Token**: Stored in `localStorage` as `forestPlus_token`.
- **User Info**: Stored in `localStorage` as `forestPlus_user`.
- **Interceptor**: `AuthInterceptor` automatically adds the Bearer token to all outgoing outgoing `/api` requests.

## 6. AI Guidelines
- **OpenAPI**: Do not manually edit files in `src/app/api/`. These are generated from the Backend Swagger definition.
- **Tailwind**: Follow the utility-first approach. Avoid writing custom CSS in `.scss` files unless strictly necessary for complex animations.
- **RxJS**: Use `Observable` and `pipe(tap(), catchError())` patterns for logic in services.
- **Standalone**: The project is using Standalone Components (Angular 14+ pattern).
