# Authentication System Testing Guide

**Date**: February 23, 2026  
**Purpose**: Verify full authentication flow after refactoring  
**Status**: Ready for Testing

---

## 🧪 Test Scenarios

### **Test 1: Fresh App Load (No Previous Login)**

**Steps**:
1. Open the app in a fresh browser session (or clear localStorage)
2. Observe the behavior

**Expected Results**:
- ✅ App loads and initializes `useAuthStore.checkAuth()`
- ✅ `isLoading = true` while checking localStorage
- ✅ Since no user data in localStorage, `isLoading = false`
- ✅ ProtectedRoute shows loading spinner, then redirects to `/auth/login`
- ✅ Login page displays normally
- ✅ No errors in browser console

**Code Flow**:
```
App.tsx → useEffect() → checkAuth()
  ↓
  localStorage.getItem('user') → null
  ↓
  set({ isLoading: false })
  ↓
  ProtectedRoute → redirect to /auth/login
```

---

### **Test 2: Successful Login (Patient)**

**Steps**:
1. Navigate to login page
2. Enter valid patient credentials:
   - Email: `patient@example.com`
   - Password: `password123`
3. Click "Login"
4. Observe redirect and page rendering

**Expected Results**:
- ✅ Login button shows loading state during API call
- ✅ API call successful with 200 status
- ✅ User data stored in `useAuthStore`
- ✅ User data persisted to localStorage
- ✅ Redirects to `/dashboard/patient`
- ✅ PatientDashboard renders with user data
- ✅ No loading spinner on protected page (isLoading = false)
- ✅ User name displays correctly

**Code Flow**:
```
Login.tsx → handleLogin()
  ↓
  useAuthStore.getState().login(email, password)
  ↓
  POST /api/user/login → { data: email, password }
  ↓
  Response: { success: true, data: { id, name, email, role: "PATIENT", ... } }
  ↓
  set({ user: userData, isLoading: false })
  ↓
  localStorage.setItem('user', JSON.stringify(userData))
  ↓
  navigate("/dashboard/patient")
```

**Verification**:
```typescript
// In browser console
useAuthStore.getState().user
// Should show: { id: "...", name: "...", email: "patient@...", role: "PATIENT" }
```

---

### **Test 3: Successful Login (Doctor)**

**Steps**:
1. Go back to login page (or logout if needed)
2. Enter valid doctor credentials:
   - Email: `doctor@example.com`
   - Password: `password123`
3. Click "Login"
4. Observe redirect and page rendering

**Expected Results**:
- ✅ Similar to Patient login, but:
- ✅ Redirects to `/dashboard/doctor`
- ✅ DoctorDashboard renders
- ✅ Uses real `isLoading` state (not hardcoded false)
- ✅ Appointments API data loads properly

**Verification**:
```typescript
// In browser console
useAuthStore.getState().user.role
// Should show: "DOCTOR"
```

---

### **Test 4: Successful Login (Admin)**

**Steps**:
1. Go back to login page
2. Enter valid admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click "Login"

**Expected Results**:
- ✅ Redirects to `/admin`
- ✅ AdminPage renders
- ✅ Role check: `user.role === "ADMIN"` ✅
- ✅ Dashboard stats and analytics display correctly

**Verification**:
```typescript
// In browser console
useAuthStore.getState().user.role
// Should show: "ADMIN"
```

---

### **Test 5: Token Persistence (Page Reload)**

**Steps**:
1. Successfully login as any user
2. You should be on the dashboard page
3. Press F5 or Ctrl+R to refresh the page
4. Observe behavior

**Expected Results**:
- ✅ Page shows loading spinner during initial load
- ✅ `checkAuth()` reads user data from localStorage
- ✅ `isLoading` transitions from `true` → `false`
- ✅ User is automatically re-authenticated
- ✅ Dashboard renders without requiring re-login
- ✅ User data is NOT lost (persisted in store)
- ✅ No loading spinner appears (isLoading is false by render time)

**Code Flow**:
```
App.tsx (on mount) → checkAuth()
  ↓
  localStorage.getItem('user') → finds saved user
  ↓
  set({ user: userData, isLoading: false })
  ↓
  ProtectedRoute → no loading spinner (isLoading=false)
  ↓
  Dashboard renders with user data intact
```

**Verification**:
```typescript
// In browser console (before and after refresh)
useAuthStore.getState().user
// Should be same before/after refresh (persistence works!)
```

---

### **Test 6: Race Condition Prevention**

**Steps**:
1. While logged in as doctor, go to `/dashboard/doctor`
2. Open browser DevTools → Network tab
3. Reload page (F5)
4. Observe the timing

**Expected Results**:
- ✅ Initial load shows loading spinner
- ✅ While `isLoading=true`, ProtectedRoute doesn't render the dashboard yet
- ✅ After `isLoading=false`, dashboard renders
- ✅ Appointments data appears (no blank state before data loads)
- ✅ No flickering of undefined data

**What This Prevents**:
- ❌ Before: Dashboard rendered while isLoading=false (hardcoded), which could be before user data loaded
- ✅ After: Dashboard only renders after isLoading transitions to false

---

### **Test 7: AdminPage Access Control**

**Steps**:
1. Login as a regular patient or doctor
2. Try to navigate directly to `/admin`
3. Observe behavior

**Expected Results**:
- ✅ ProtectedRoute checks: `user && user.role === "ADMIN"`
- ✅ Since user role is not "ADMIN", redirect happens
- ✅ Redirect to `/auth/login` (or home page, depending on logic)
- ✅ No flash of admin content before redirect

**Code Check**:
```tsx
// In AdminPage.tsx
useEffect(() => {
  if (!isLoading && (!user || user.role !== "ADMIN")) {
    navigate("/auth/login");  // ✅ Fixed: was "admin", now "ADMIN"
  }
}, [user, isLoading, navigate]);
```

---

### **Test 8: Logout Functionality**

**Steps**:
1. Login as any user
2. Click the logout button (usually in navbar)
3. Observe behavior

**Expected Results**:
- ✅ `logout()` called from store
- ✅ Store state: `set({ user: null })`
- ✅ localStorage cleared: `localStorage.removeItem('user')`
- ✅ Redirect to `/auth/login` or home page
- ✅ Protected routes now show login page (not dashboard)
- ✅ No user data in localStorage after logout

**Code Flow**:
```
navbar.tsx → handleLogout()
  ↓
  useAuthStore.getState().logout()
  ↓
  set({ user: null })
  ↓
  localStorage.removeItem('user')
  ↓
  navigate("/auth/login")
```

**Verification**:
```typescript
// After logout, in browser console:
useAuthStore.getState().user
// Should show: null

localStorage.getItem('user')
// Should show: null
```

---

### **Test 9: Loading Spinner Visibility**

**Steps**:
1. Clear localStorage
2. Reload the app
3. Immediately check browser console within first 0.5 seconds

**Expected Results**:
- ✅ ProtectedRoute displays loading spinner
- ✅ Spinner shows Loader2 icon from lucide-react
- ✅ Text says "Loading..."
- ✅ Spinner disappears after auth check completes (~100-200ms)

**Visual Check**:
```tsx
// ProtectedRoute.tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}
```

---

### **Test 10: API Error Handling**

**Steps**:
1. Go to login page
2. Enter invalid credentials:
   - Email: `invalid@example.com`
   - Password: `wrongpassword`
3. Click "Login"
4. Observe error handling

**Expected Results**:
- ✅ Login button shows loading state
- ✅ API returns error (401 or 400)
- ✅ Error caught in `login()` method in authstore
- ✅ Error properly re-thrown as: `throw new Error(error.message)`
- ✅ Login.tsx catches error and shows toast notification
- ✅ Toast displays: API error message or default message
- ✅ User stays on login page (not redirected)
- ✅ Can retry login

**Code Flow**:
```
login() catch block:
  if (axios.isAxiosError(err) && err.response) {
    throw new Error(err.response.data?.message || 'Login failed');
  }
  throw new Error('Unknown error occurred');

Login.tsx catch block:
  if (err instanceof Error) {
    toast.error(err.message);  // ✅ Displays error
  }
```

---

### **Test 11: Multiple Tabs/Windows**

**Steps**:
1. Login in Tab A
2. Open Tab B to the same app
3. Observe both tabs

**Expected Results**:
- ✅ Tab A: App is logged in
- ✅ Tab B: Shows loading spinner initially
- ✅ Tab B: After auth check, shows dashboard (thanks to localStorage)
- ✅ Both tabs show same user data
- ✅ LocalStorage acts as sync point between tabs

**Note**: If you want real-time sync across tabs, Zustand provides middleware for that, but localStorage persistence is good enough for now.

---

### **Test 12: Dark/Light Mode + Auth**

**Steps**:
1. Login with theme as Light
2. Switch to Dark mode
3. Reload page
4. Verify both theme and auth persist

**Expected Results**:
- ✅ Theme preference persists (separate from auth)
- ✅ User data persists (auth)
- ✅ Both work independently
- ✅ No conflicts between useAuthStore and theme-context

---

## 🔍 Browser Console Debugging

### Check Current Auth State:
```typescript
// Get entire state
useAuthStore.getState()

// Get just the user
useAuthStore.getState().user

// Check loading state
useAuthStore.getState().isLoading

// Check localStorage directly
localStorage.getItem('user')
```

### Test Methods:
```typescript
// Test login
await useAuthStore.getState().login('test@example.com', 'password')

// Test logout
useAuthStore.getState().logout()

// Check auth
await useAuthStore.getState().checkAuth()
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "isLoading is not defined"
**Cause**: Page didn't update to use new store  
**Solution**: Update to:
```tsx
const isLoading = useAuthStore((state) => state.isLoading);
```

### Issue 2: Role check failing (admin page redirects)
**Cause**: Role mismatch (`"admin"` vs `"ADMIN"`)  
**Solution**: Use uppercase role names:
```tsx
if (user.role !== "ADMIN")  // ✅ Not "admin"
```

### Issue 3: Race condition (undefined data on load)
**Cause**: Data rendered before isLoading becomes false  
**Solution**: Check isLoading before rendering:
```tsx
if (isLoading) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;
// Safe to use user now
```

### Issue 4: Logout doesn't work
**Cause**: Not calling logout from store  
**Solution**: Use:
```tsx
useAuthStore.getState().logout()  // ✅ Correct
// NOT: user = null  ❌ Doesn't work
```

### Issue 5: User doesn't persist after refresh
**Cause**: localStorage not being set  
**Solution**: Ensure login() completes successfully and sets user in store

---

## 📋 Checklist Before Going Live

- [ ] Test fresh load (no localStorage)
- [ ] Test patient login
- [ ] Test doctor login
- [ ] Test admin login
- [ ] Test page reload (persistence)
- [ ] Test token refresh flow (if implemented)
- [ ] Test logout
- [ ] Test access control (wrong role can't access admin)
- [ ] Test API error handling
- [ ] Test loading spinner visibility
- [ ] Test multiple tabs sync
- [ ] No console errors
- [ ] No TypeScript compilation errors
- [ ] AdminPage uses "ADMIN" role (uppercase)
- [ ] DoctorDashboard uses real isLoading (not hardcoded false)
- [ ] ProtectedRoute shows loading spinner
- [ ] Login.tsx uses useAuthStore.getState().login()

---

## 🚀 Performance Verification

Run these commands to check build:

```bash
# This will check for:
# - TypeScript compilation errors
# - Vite build success
# - No unused imports
# - Proper tree shaking
npm run build
```

Expected output:
```
✓ XX files transformed
✓ built in XXXms
```

---

## ✅ Sign-Off Criteria

All of the following must pass:

1. ✅ TypeScript compilation: `npm run build` succeeds
2. ✅ Auth flow: Login → Redirect → Dashboard works
3. ✅ Persistence: Reload page preserves user
4. ✅ Role check: Admin page checks for "ADMIN" role
5. ✅ Loading state: ProtectedRoute shows spinner
6. ✅ Race conditions: Fixed with proper isLoading state
7. ✅ Error handling: Invalid login shows error toast
8. ✅ Logout: Clears user and localStorage
9. ✅ No old auth-context usage: All pages use authstore
10. ✅ Console clean: No deprecation warnings or errors

---

## 📞 Support

If you encounter issues:

1. **Check** `AUTH_REFACTORING_SUMMARY.md` for implementation details
2. **Search** for TODO comments: `grep -r "TODO" src/ | grep -i auth`
3. **Verify** `authstore.ts` has all required methods
4. **Check** console for specific error messages
5. **Review** the file changes in this document

---

**Testing Started**: ___________  
**Testing Completed**: ___________  
**Tester Name**: ___________  
**Notes**: ___________________________________________  
___________________________________________________________________
