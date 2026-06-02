# Custom domain for URsignature (Cloudflare Worker)

The app is deployed as a **Cloudflare Worker** at `https://ursignature.ursignature.workers.dev`. To use your own domain (e.g. `www.ursignature.com` or `ursignature.com`):

## Steps (Cloudflare Dashboard)

1. **Open Workers & Pages**  
   Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**.

2. **Select your Worker**  
   Click **ursignature** (your Worker).

3. **Add a custom domain**  
   - Go to **Settings** → **Domains & Routes** (or **Triggers** → **Custom Domains**).  
   - Click **Add** / **Add Custom Domain**.  
   - Enter your domain (e.g. `www.ursignature.com` or `ursignature.com`).  
   - Follow the prompts. Cloudflare will create the DNS records if the domain is on Cloudflare; otherwise you’ll get CNAME (or A/AAAA) instructions to add at your DNS provider.

4. **DNS**  
   - If the domain is **on Cloudflare**: records are added automatically.  
   - If the domain is **elsewhere**: add the CNAME (or A/AAAA) record Cloudflare shows. For root domain (`ursignature.com`), Cloudflare may use CNAME flattening or give you A/AAAA targets.

5. **SSL**  
   Cloudflare provisions a certificate for the custom domain. Wait a few minutes for it to become active.

After that, your site will be available at your custom domain as well as at `https://ursignature.ursignature.workers.dev`. No code or `wrangler.jsonc` changes are required.
