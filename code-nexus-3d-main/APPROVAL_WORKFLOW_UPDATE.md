# Approval Workflow Update

## ✅ Changes Completed

### Updated Approval Workflow

The system now correctly implements the following approval workflow:

| Role | Default Status after Sign-Up | Needs Approval From | Auto-Approved? |
|------|------------------------------|---------------------|----------------|
| **SUPER_ADMIN** | `approved` | — | ✅ Yes |
| **STAFF** | `approved` | — | ✅ Yes |
| **ADMIN** | `pending` | Super Admin | ❌ No |
| **TEACHER** | `pending` | Admin | ❌ No |
| **STUDENT** | `pending` | Staff | ❌ No |

### Files Modified

#### 1. `src/services/auth.ts`
**Changes:**
- Updated `signin` method to check for TEACHER pending status (lines 214-224)
- Added TEACHER to the pending approval check
- Added TEACHER to the rejected status check
- Updated error messages to specify "admin" as the approver for teachers

**Key Code:**
```typescript
// Check if user is pending approval
if ((user.role === 'STUDENT' || user.role === 'ADMIN' || user.role === 'TEACHER') && user.status === 'pending') {
  const roleText = user.role === 'STUDENT' ? 'student' : user.role === 'ADMIN' ? 'admin' : 'teacher';
  const approverRole = user.role === 'STUDENT' ? 'staff' : user.role === 'ADMIN' ? 'super admin' : 'admin';
  return { success: false, error: `Your ${roleText} account is pending approval. Please wait for ${approverRole} approval.` };
}
```

#### 2. `src/pages/dashboard/AdminDashboard.tsx`
**Changes:**
- Imported `AuthService` and `User` type
- Changed `staffMembers` state to `pendingTeachers` (User[] type)
- Updated `AdminStats` interface: `pendingStaff` → `pendingTeachers`
- Modified `loadAdminData` to fetch pending teachers from `AuthService.getPendingUsers('TEACHER')`
- Added `approveTeacher` and `rejectTeacher` functions
- Updated the "Staff Approval Management" tab to "Teacher Approval Management"
- Modified the table to display teacher information (name, email, college, department, status, applied date)
- Connected approve/reject buttons to the new teacher approval functions

**Key Features:**
- Real-time loading of pending teachers from the authentication system
- Approval/rejection with toast notifications
- Automatic refresh of pending teachers list after approval/rejection
- Display of teacher details including college and department

### How It Works

1. **Teacher Signs Up:**
   - Teacher creates an account with role = 'TEACHER'
   - Status is automatically set to 'pending'
   - Teacher cannot log in until approved

2. **Admin Reviews:**
   - Admin logs into Admin Dashboard
   - Navigates to "Teacher Approval Management" tab (formerly "Staff Approval")
   - Sees list of all pending teachers with their details

3. **Admin Approves/Rejects:**
   - Admin clicks "Approve" or "Reject" button
   - System updates teacher's status in the database
   - Teacher receives notification of approval/rejection
   - Pending teachers list automatically refreshes

4. **Teacher Login:**
   - If approved: Teacher can now log in and access Teacher Dashboard
   - If rejected: Teacher sees rejection message and cannot log in
   - If pending: Teacher sees "pending approval" message

### Testing the Workflow

To test the complete workflow:

1. **Create a Teacher Account:**
   ```
   - Go to Sign Up page
   - Select role: TEACHER
   - Fill in details
   - Submit
   ```

2. **Verify Pending Status:**
   ```
   - Try to log in with teacher credentials
   - Should see: "Your teacher account is pending approval. Please wait for admin approval."
   ```

3. **Admin Approval:**
   ```
   - Log in as ADMIN
   - Go to Admin Dashboard
   - Click on "Teacher Approval Management" tab
   - See the pending teacher in the list
   - Click "Approve" button
   ```

4. **Teacher Login After Approval:**
   ```
   - Log in with teacher credentials
   - Should successfully access Teacher Dashboard
   ```

### Benefits

✅ **Proper Role Hierarchy:** Teachers now require admin approval, maintaining organizational structure

✅ **Security:** Prevents unauthorized teacher accounts from accessing the system

✅ **Accountability:** Admins have control over who can become a teacher in their institution

✅ **User Experience:** Clear messaging about approval status and who needs to approve

✅ **Real-time Updates:** Pending teachers list updates immediately after approval/rejection

### Future Enhancements

Consider adding:
- Email notifications when teachers are approved/rejected
- Bulk approval for multiple teachers
- Teacher profile review before approval (qualifications, experience)
- Approval history/audit trail
- Filtering and search in pending teachers list

---

**Last Updated:** 2025-10-23
**Status:** ✅ Complete and Ready for Testing

