# React App Code Style Guidelines

Code style guidelines for AI agents working on the React documentation site frontend.

## File Organization

```
react-app/
├── components/      # Reusable React components (Header.tsx, Footer.tsx)
├── pages/           # Route page components (Home.tsx, Search.tsx)
├── libs/            # Frontend utilities and helpers
├── types/           # TypeScript type definitions
└── main.tsx         # React entry point
```

## Import Style

**Path Alias:** Use `@/*` for `./src/react-app/*`

**Import Order:**
1. React and React ecosystem
2. External UI libraries (lucide-react, etc.)
3. Internal components/pages
4. Utilities and types

**Example:**
```typescript
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, Github } from "lucide-react";
import { Header } from "@/components/Header";
import { formatLocationName } from "@/libs/name";
import type { Location } from "@/types";
```

## Component Pattern

**Always use functional components with TypeScript:**

```typescript
import { useState, useEffect } from "react";

type HeaderProps = {
  title: string;
  onSearch?: (query: string) => void;
};

export function Header({ title, onSearch }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Side effects here
  }, []);

  return (
    <header className="bg-white border-b">
      <h1>{title}</h1>
    </header>
  );
}
```

**Key Points:**
- Use named exports: `export function Component()`
- Define prop types with `type` or `interface`
- Destructure props in parameters
- Use `PascalCase` for component names and files

## TypeScript in React

**Prop Types:**
```typescript
// Basic props
type ButtonProps = {
  text: string;
  onClick: () => void;
  disabled?: boolean;
};

// Props with children
type LayoutProps = {
  children: React.ReactNode;
  className?: string;
};

// Event handlers
type InputProps = {
  value: string;
  onChange: (value: string) => void;
};
```

**Event Handlers:**
```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Handle click
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

## React Hooks

**useState:**
```typescript
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
```

**useEffect:**
```typescript
// Run once on mount
useEffect(() => {
  fetchData();
}, []);

// Run when dependencies change
useEffect(() => {
  fetchData(id);
}, [id]);

// Cleanup
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

**Custom Hooks:**
```typescript
export function useApiStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    fetch("/api/health")
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"));
  }, []);

  return status;
}
```

## React Router (v7)

**Route Definition:**
```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/location/:code" element={<LocationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Navigation:**
```typescript
// Link component
<Link to="/search" className="nav-link">Search</Link>

// useNavigate hook
const navigate = useNavigate();
navigate("/search");

// Route parameters
const { code } = useParams<{ code: string }>();
```

## Data Fetching

**Standard Pattern:**
```typescript
import { useState, useEffect } from "react";

type Province = {
  code: string;
  name_en: string;
  name_km: string;
};

export function ProvinceList() {
  const [data, setData] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/provinces")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setData(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {data.map((province) => (
        <li key={province.code}>{province.name_en}</li>
      ))}
    </ul>
  );
}
```

## Tailwind CSS (v4)

**Styling Patterns:**
```typescript
// Basic styling
<div className="bg-white rounded-lg shadow-md p-4">
  Content
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Items
</div>

// Hover and focus states
<button className="bg-blue-500 hover:bg-blue-600 focus:ring-2">
  Click me
</button>

// Conditional classes
<div className={`base-class ${isActive ? "active" : "inactive"}`}>
  Content
</div>
```

**Class Order:** Layout → Sizing → Typography → Visual → Interactive

## Common Patterns

**Conditional Rendering:**
```typescript
// Ternary for if/else
{isLoggedIn ? <Dashboard /> : <Login />}

// && for if only
{hasData && <DataDisplay data={data} />}

// Early return
if (!data) return <EmptyState />;
return <DataDisplay data={data} />;
```

**Lists and Keys:**
```typescript
{items.map((item) => (
  <ListItem key={item.id} item={item} />
))}
```

**Forms:**
```typescript
function SearchForm({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  );
}
```

## Accessibility

**Semantic HTML:**
```typescript
// Good
<header>
  <nav>
    <ul>
      <li><a href="/home">Home</a></li>
    </ul>
  </nav>
</header>

// Avoid div soup
```

**ARIA Attributes:**
```typescript
<button
  type="button"
  aria-label="Close menu"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <X />
</button>
```

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `Header.tsx`, `SearchBar.tsx`)
- Pages: `PascalCase.tsx` (e.g., `Home.tsx`, `LocationPage.tsx`)
- Utils: `camelCase.ts` (e.g., `formatName.ts`, `apiClient.ts`)

**Code:**
- Components/Types: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_CASE`

## Error Handling

**Always handle loading and error states:**
```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
return <DataDisplay data={data} />;
```

## Performance

**React.memo for expensive components:**
```typescript
import { memo } from "react";

export const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* Expensive rendering */}</div>;
});
```

**useMemo and useCallback:**
```typescript
import { useMemo, useCallback } from "react";

const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

const handleClick = useCallback(() => {
  processData(id);
}, [id]);
```
