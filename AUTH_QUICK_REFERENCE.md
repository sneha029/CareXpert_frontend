# Authentication System - Quick Reference Guide

**For Developers Working with CareXpert Frontend**

---

## 🚀 Quick Start - Using Auth in Your Component

### Get User Data:
```tsx
import { useAuthStore } from '@/store/authstore';

export default function MyComponent() {
  const user = useAuthStore((state) => state.user);
  
  return <p>Hello, {user?.name}!</p>;
}
```

### Check Loading State:
```tsx
const isLoading = useAuthStore((state) => state.isLoading);

if (isLoading) return <Spinner />;
if (!user) return <p>Please login</p>;
```

### Get Multiple States:
```tsx
const { user, isLoading, logout } = useAuthStore((state) => ({
  user: state.user,
  isLoading: state.isLoading,
  logout: state.logout,
}));
```

---

## 🔧 Core Methods

### `login(email, password)` 
Authenticates user with API

```tsx
try {
  await useAuthStore.getState().login('user@example.com', 'password');
  navigate('/dashboard');
} catch (err) {
  console.error(err.message);
}
```

### `logout()`
Clears user and localStorage

```tsx
useAuthStore.getState().logout();
navigate('/auth/login');
```

### `setUser(user)`
Manually set user (rarely needed)

```tsx
useAuthStore.getState().setUser({ 
  id: '123', 
  name: 'John',
  email: 'john@example.com',
  role: 'PATIENT',
  profilePicture: 'url',
  refreshToken: 'token'
});
```

### `checkAuth()`
Verify and restore auth from localStorage (called automatically on app load)

```tsx
await useAuthStore.getState().checkAuth();
```

---

## 🧠 State Structure

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  refreshToken: string;
}

// Zustand state
{
  user: User | null;
  isLoading: boolean;
  login: (email, password) => Promise<void>;
  logout: () => void;
  setUser: (user) => void;
  checkAuth: () => Promise<void>;
}
```

---

## 📍 Where Auth is Used

### **Core Files**:
- `src/store/authstore.ts` - Main auth logic
- `src/App.tsx` - Initializes auth on load
- `src/components/ProtectedRoute.tsx` - Guards protected pages

### **Key Pages**:
- `src/pages/auth/Login.tsx` - User login
- `src/pages/AdminPage.tsx` - Admin dashboard (admin-only)
- `src/pages/DoctorDashboard.tsx` - Doctor dashboard
- `src/pages/PatientDashboard.tsx` - Patient dashboard

### **Components**:
- `src/components/navbar.tsx` - Logout button
- `src/components/sidebar.tsx` - User info display

---

## 🔐 User Roles

```
PATIENT   - Can book appointments, view prescriptions, chat with doctors
DOCTOR    - Can manage appointments, add prescriptions, view patient history
ADMIN     - Can manage all users, view analytics, manage system
```

---

## 🚦 Auth Flow Diagram

```
┌──────────────┐
│ User Opens   │
│ App          │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ App.tsx              │
│ checkAuth() runs     │
│ isLoading = true     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Check localStorage       │
│ for saved user           │
└──────┬───────────────────┘
       │
    ┌──┴──┐
    │     │
    ▼     ▼
 Found   Not Found
   │       │
   ▼       ▼
Restore  isLoading=false
to store Continue
   │       │
   └───┬───┘
       │
       ▼
┌──────────────────────────┐
│ ProtectedRoute checks    │
│ - Is user logged in?     │
│ - Show spinner if        │
│   isLoading=true         │
└──────┬───────────────────┘
       │
    ┌──┴──┐
    │     │
    ▼     ▼
  User   No User
   │       │
   ▼       ▼
Render  Redirect
Page    to /login
```

---

## ⚠️ Common Patterns to AVOID

### ❌ DON'T: Import from old context
```tsx
import { useAuth } from "../context/auth-context";  // ❌ DEPRECATED
```

### ✅ DO: Import from authstore
```tsx
import { useAuthStore } from "@/store/authstore";  // ✅ CORRECT
```

---

### ❌ DON'T: Hardcode loading state
```tsx
const isLoading = false;  // ❌ WRONG - causes race conditions
```

### ✅ DO: Use store's isLoading
```tsx
const isLoading = useAuthStore((state) => state.isLoading);  // ✅ CORRECT
```

---

### ❌ DON'T: Wrong role name
```tsx
if (user.role !== "admin") { }  // ❌ WRONG - API uses uppercase
```

### ✅ DO: Use correct role
```tsx
if (user.role !== "ADMIN") { }  // ✅ CORRECT - matches API
```

---

### ❌ DON'T: Duplicate auth logic
```tsx
// Don't call API directly in component
const handleLogin = async () => {
  const res = await axios.post('/api/user/login', ...);  // ❌ Wrong place
};
```

### ✅ DO: Use store method
```tsx
// Use centralized store method
const handleLogin = async () => {
  await useAuthStore.getState().login(email, password);  // ✅ Correct
};
```

---

## 🛡️ Best Practices

### 1. Always Check Loading State Before Rendering
```tsx
if (isLoading) return <LoadingSpinner />;
if (!user) return <NotLoggedIn />;
// Now safe to use user
return <Dashboard user={user} />;
```

### 2. Use Selective Destructuring for Performance
```tsx
// Good - only subscribe to user
const user = useAuthStore((state) => state.user);

// Also good - subscribe to multiple
const { user, isLoading } = useAuthStore((state) => ({
  user: state.user,
  isLoading: state.isLoading,
}));

// Avoid - subscribes to entire state
const state = useAuthStore();  // ❌ Re-renders on any change
```

### 3. Handle Async Operations
```tsx
const handleLogin = async () => {
  try {
    await useAuthStore.getState().login(email, password);
    navigate('/dashboard');
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    toast.error(errorMsg);
  }
};
```

### 4. Use Proper useEffect Dependencies
```tsx
useEffect(() => {
  if (!isLoading && (!user || user.role !== 'ADMIN')) {
    navigate('/auth/login');
  }
}, [user, isLoading, navigate]);  // ✅ Include all dependencies
```

### 5. Clear Auth on Logout
```tsx
const handleLogout = () => {
  useAuthStore.getState().logout();  // Clears store AND localStorage
  navigate('/auth/login');
};
```

---

## 📝 Type Definitions

Add these to your file if you need type safety:

```typescript
import { useAuthStore } from '@/store/authstore';

// Get the full store type
type AuthStore = ReturnType<typeof useAuthStore.getState>;

// Get just the User type
interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  refreshToken: string;
}
```

---

## 🔍 Debugging Tips

### Check Auth State in Console:
```typescript
// See entire state
useAuthStore.getState()

// See just user
useAuthStore.getState().user

// See loading state
useAuthStore.getState().isLoading
```

### Watch Store Changes:
```typescript
// Subscribe to all changes
const unsubscribe = useAuthStore.subscribe((state) => {
  console.log('Auth state changed:', state);
});

// Stop watching
unsubscribe();
```

### Check LocalStorage:
```typescript
// See what's saved
localStorage.getItem('user')

// Clear everything
localStorage.removeItem('user')
```

---

## 🚨 Troubleshooting

### User Doesn't Persist After Refresh
**Check**:
1. Is `checkAuth()` being called in `App.tsx`?
2. Does `localStorage.getItem('user')` show data?
3. Is login API returning success?

### Role Check Not Working
**Check**:
1. Is role uppercase? ("ADMIN" not "admin")
2. Is compareStatement correct? (`!== "ADMIN"` not `!== "admin"`)
3. Does API return correct role in response?

### Loading Spinner Stuck
**Check**:
1. Is `checkAuth()` completing?
2. Is `isLoading` being set to `false`?
3. Check browser console for errors

### Logout Doesn't Clear Data
**Check**:
1. Are you calling `useAuthStore.getState().logout()`?
2. Is `localStorage.removeItem('user')` being called?
3. Check that `set({ user: null })` happens

---

## 📊 Migration Checklist

If adding a new feature that needs auth:

- [ ] Import `useAuthStore` from `@/store/authstore`
- [ ] Get `user` and `isLoading` from store
- [ ] Check `isLoading` before rendering (prevent race conditions)
- [ ] Verify user has correct role if role-restricted
- [ ] Add proper error handling
- [ ] Use store methods, not direct API calls
- [ ] Test with different user roles
- [ ] Test page reload persistence
- [ ] No TypeScript errors

---

## 🎯 Common Use Cases

### Display User Name:
```tsx
const user = useAuthStore((state) => state.user);
<p>{user?.name}</p>
```

### Show Admin-Only Content:
```tsx
const user = useAuthStore((state) => state.user);
if (user?.role === 'ADMIN') {
  return <AdminPanel />;
}
```

### Handle Login in Form:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await useAuthStore.getState().login(email, password);
    navigate('/dashboard');
  } catch (err) {
    toast.error('Login failed');
  }
};
```

### Conditionally Render Based on Auth:
```tsx
const user = useAuthStore((state) => state.user);
const isLoading = useAuthStore((state) => state.isLoading);

if (isLoading) return <Spinner />;
if (!user) return <LoginPrompt />;
return <ProtectedContent />;
```

---

## 📞 Need More Help?

1. Read `AUTH_REFACTORING_SUMMARY.md` for detailed implementation info
2. Check `AUTH_TESTING_GUIDE.md` for testing procedures
3. Review `src/store/authstore.ts` for the actual implementation
4. Look at `src/pages/auth/Login.tsx` for usage example
5. Check `src/components/ProtectedRoute.tsx` for auth guard example

---

**Last Updated**: February 23, 2026  
**Status**: ✅ Production Ready
