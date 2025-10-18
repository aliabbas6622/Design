# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `GEMINI_API_KEY` for word generation
- [ ] Set `CLIPDROP_API_KEY` for image generation
- [ ] Set `OPENAI_API_KEY` (optional)

### 2. Build & Test
```bash
npm install
npm run build
npm run dev  # Test locally first
```

### 3. Production Optimizations
- [x] Responsive design (mobile, tablet, desktop)
- [x] Username validation and duplicate checking
- [x] Error handling for API failures
- [x] Loading states for all async operations
- [x] Local storage persistence
- [x] Real-time submission polling

### 4. Security
- [ ] API keys stored in environment variables only
- [ ] No sensitive data in client-side code
- [ ] Input validation and sanitization
- [ ] Rate limiting (implement if needed)

### 5. Performance
- [x] Image optimization
- [x] Code splitting with React lazy loading
- [x] Minimal bundle size
- [x] Efficient re-renders with React.memo

## Deployment Platforms

### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Netlify
```bash
npm run build
# Deploy the `out` or `build` folder
```

### AWS Amplify
1. Connect GitHub repository
2. Set environment variables in console
3. Deploy automatically on push

## Post-Deployment

### Monitoring
- Check browser console for errors
- Monitor API usage and costs
- Set up error tracking (Sentry, LogRocket)

### Testing
- [ ] Test on mobile devices
- [ ] Test username editing and validation
- [ ] Test submission flow
- [ ] Test image generation
- [ ] Test archive functionality

## Environment Variables in Production

Set these in your hosting platform:
- `GEMINI_API_KEY`
- `CLIPDROP_API_KEY`
- `OPENAI_API_KEY` (optional)
- `NODE_ENV=production`

## Troubleshooting

### Images not generating
- Verify ClipDrop API key is set
- Check API quota limits
- Enable images in admin panel

### Submissions not saving
- Check browser local storage
- Verify backend API endpoints
- Check network tab for errors

### Username validation issues
- Clear browser cache and cookies
- Check submissions array in context
