# Desplegar Q'Paso Ayer en Azure

App: Next.js 16 (output `standalone`) + Prisma. Recomendado: **Azure App Service (Linux, Node 20)**.

## Variables de entorno (App Service → Configuration → Application settings)
```
DATABASE_URL=file:/home/data/dev.db      # ruta persistente en App Service (/home persiste)
SESSION_SECRET=<genera-uno-largo-y-aleatorio>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<clave-fuerte>
NEXT_PUBLIC_SITE_URL=https://<tu-app>.azurewebsites.net
AZURE_OPENAI_ENDPOINT=https://<tu-recurso>.openai.azure.com
AZURE_OPENAI_API_KEY=<key>
AZURE_OPENAI_DEPLOYMENT=<nombre-del-deployment>
AZURE_OPENAI_API_VERSION=2024-08-01-preview
NEXT_PUBLIC_WHATSAPP=+507 ....
WEBSITE_RUN_FROM_PACKAGE=0
SCM_DO_BUILD_DURING_DEPLOYMENT=1
```

## Ruta A — rápida (SQLite en /home, ideal para un solo local)
`/home` persiste entre reinicios en App Service, así que SQLite funciona para tráfico bajo.

1. Crear **Resource Group** y **App Service** (Linux, runtime **Node 20 LTS**, plan B1 o superior).
2. Configurar las variables de arriba (con `DATABASE_URL=file:/home/data/dev.db`).
3. **Startup Command** (App Service → Configuration → General settings → Startup Command):
   ```
   mkdir -p /home/data && npx prisma db push --skip-generate && node prisma/seed.js || true; node server.js
   ```
   > Nota: con `output: standalone`, el server queda en `server.js`. Si usas el seed, compílalo o cambia el comando por `npx tsx prisma/seed.ts`. Para no re-sembrar en cada arranque, ejecuta el seed una sola vez y luego quita esa parte del comando.
4. Deploy del código (elige uno):
   - **az CLI (zip):** `npm run build` local y luego `az webapp deploy --resource-group <rg> --name <app> --src-path <zip>`; o
   - **GitHub Actions:** conectar el repo desde App Service → Deployment Center (build automático).
   - **VS Code Azure App Service:** clic derecho → Deploy to Web App.

## Ruta B — producción con PostgreSQL (escala)
1. Crear **Azure Database for PostgreSQL Flexible Server** (Burstable B1ms para empezar). Guardar host, usuario y contraseña.
2. Cambiar el provider de Prisma a postgres:
   - Editar `prisma/schema.prisma`: `provider = "postgresql"`.
   - `DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>?sslmode=require`
3. En local: `npx prisma migrate dev --name init` (crea migración). En el deploy: `npx prisma migrate deploy`.
4. Startup Command: `npx prisma migrate deploy && node server.js`.
5. Sembrar una vez: `npx tsx prisma/seed.ts` (o correrlo desde el Kudu/SSH del App Service).

## Post-deploy
- Configurar dominio propio + HTTPS (App Service → Custom domains).
- Actualizar `NEXT_PUBLIC_SITE_URL` al dominio real (afecta sitemap/SEO).
- Enviar `https://<dominio>/sitemap.xml` a Google Search Console para indexar el blog.
- Cambiar `ADMIN_PASSWORD` por una clave fuerte.
- Cargar tu logo/artes definitivos y la carta oficial.

## Notas
- `standalone` copia solo lo necesario a `.next/standalone`. Asegúrate de incluir `public/` y `.next/static` junto al `server.js` (Azure lo hace con build en el servidor: `SCM_DO_BUILD_DURING_DEPLOYMENT=1`).
- Las imágenes subidas por el admin van a `/public/uploads`; en producción con SQLite en `/home` conviene guardar también las subidas en `/home` o en Azure Blob Storage para que persistan.
