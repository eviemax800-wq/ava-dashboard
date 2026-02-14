# Quick Start: Deploy Assignments Feature

## Step 1: Run Database Migration

### Automated Check
```bash
cd /Users/evie/.openclaw/workspace/ava-dashboard
node check-assignments-table.js
```

### Manual Migration (if needed)

1. **Open Supabase SQL Editor**:
   https://supabase.com/dashboard/project/ilriyvzvwarnqrbnranq/sql/new

2. **Copy this SQL**:
   ```bash
   cat supabase/migrations/20260212_assigned_tasks.sql
   ```

3. **Paste and Run** in the SQL editor

4. **Verify**:
   Run `node check-assignments-table.js` again

---

## Step 2: Test Locally

```bash
npm run dev
```

Visit: **http://localhost:3000/dashboard/assignments**

### Test Checklist
- [ ] Page loads without errors
- [ ] Can create new assignment
- [ ] Can edit assignment
- [ ] Can delete assignment
- [ ] Filters work (status, priority, executor)
- [ ] Search works
- [ ] Mobile view works

---

## Step 3: Deploy to Production

```bash
# Build and verify
npm run build

# Deploy to Vercel
vercel --prod
```

Visit: **https://ava-dashboard.vercel.app/dashboard/assignments**

---

## Troubleshooting

### Table Not Created
```bash
# Check if migration ran
node check-assignments-table.js

# If not, manually run SQL in Supabase dashboard
```

### Build Errors
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

### API Errors
- Check Supabase connection in `.env.local`
- Verify RLS policies in Supabase dashboard
- Check browser console for detailed errors

---

## Quick Commands

```bash
# Full deploy workflow
cd /Users/evie/.openclaw/workspace/ava-dashboard
node check-assignments-table.js  # Verify migration
npm run build                     # Test build
vercel --prod                     # Deploy
```

---

**Ready to go!** 🚀

After deployment, the assignments feature will be live at:
- Local: http://localhost:3000/dashboard/assignments
- Production: https://ava-dashboard.vercel.app/dashboard/assignments
