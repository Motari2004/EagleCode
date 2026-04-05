# Scorpio AI Website Builder TODO

## Current Status
- [x] Explored project structure (app/builder/page.tsx, hooks, ui components)
- [x] Analyzed page.tsx issues (duplicates, comments, console.logs, loading states)
- [ ] Cleanup page.tsx (remove duplicates/comments, fix typo "Intergrate"→"Integrate", standardize imports)
- [ ] Test preview blob URL loading and navigation
- [ ] Verify AI edit endpoint integration
- [ ] Backend deps: Run `python backend/main.py`
- [ ] Frontend deps: `npm i @stackblitz/sdk jszip file-saver sonner react-syntax-highlighter @types/react-syntax-highlighter lucide-react`
- [ ] Full e2e test: Prompt → Build → Edit → Save → Load → Preview → Deploy modal
- [ ] Deploy to Vercel (add token input if missing)

## Next Steps
1. Edit page.tsx per plan
2. Install deps if needed
3. Test locally: `npm run dev`
4. Backend: `cd ../backend && python main.py`

