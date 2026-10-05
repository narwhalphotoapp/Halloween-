# 🎃 Halloween Photo Wall

A mobile-first QR-code wedding-wall style photo board for Halloween.

## Features
- No login or sign-in.
- Guests take a photo or choose one from their phone.
- Optional short message.
- Automatic anonymous visitor ID such as `spooky-a1b2c3d4`.
- Photos appear as Polaroids.
- Supabase Realtime updates the wall for everyone.

## Supabase setup
1. Open the Supabase project used by `app.js`.
2. Create a Storage bucket called `HalloweenPolaroids` and make it public.
3. Run `setup.sql` in the SQL editor.
4. Enable Realtime for `public.halloween_polaroids` if it is not already enabled.
5. Deploy the three site files to Netlify/Cloudflare Pages/GitHub Pages.

The anonymous visitor ID is stored only in the guest's browser local storage. No email or login is collected.
