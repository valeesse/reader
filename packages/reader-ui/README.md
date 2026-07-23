# Frontend structure

The frontend is organized by responsibility:

- `components/library`: library browsing, covers, series, and WebDAV library UI.
- `components/reader`: reader chrome, settings panel, and reader view components.
- `components/settings`: application settings screens and sections.
- `components/shell`: top-level navigation and library shell composition.
- `reader`: the reading engine, publication adapters, navigation, layout, and runtime hooks.
- `lib`: shared application services and utilities such as backend transport, persistence, settings, and series helpers.
- `store`: application state and context.
- `vendor`: checked-in third-party runtime assets and declarations.

Keep route-level dynamic imports in `App.tsx` and `main.tsx` explicit so the startup path remains visible. Avoid barrel exports across `reader` and `components`; direct imports preserve clear dependency boundaries and predictable code splitting.
