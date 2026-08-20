#!/usr/bin/env bash
# Despliegue PaaS de Q'Paso Ayer en Azure (ejecutar en el Azure Cloud Shell, dentro de ~/app).
# Secretos por variable de entorno: PGPASS, SESSION_SECRET, ADMIN_PASSWORD, DOOR_PASSWORD,
#   AZ_OAI_ENDPOINT, AZ_OAI_KEY, AZ_OAI_DEPLOYMENT, AZ_OAI_APIVER
set -uo pipefail

: "${PGPASS:?falta PGPASS}"; : "${SESSION_SECRET:?falta SESSION_SECRET}"
: "${ADMIN_PASSWORD:?falta ADMIN_PASSWORD}"; : "${DOOR_PASSWORD:?falta DOOR_PASSWORD}"

RG=rg-qpaso; LOC=spaincentral; SUF=$(openssl rand -hex 3)
APP=qpaso; VNET=$APP-vnet; PG=$APP-pg-$SUF; DBNAME=qpasodb; ST=${APP}st$SUF; PLAN=$APP-plan; WEB=$APP-web-$SUF
ZONE=${APP}db.private.postgres.database.azure.com

echo "=== SUF=$SUF  WEB=$WEB  PG=$PG  ST=$ST ==="

echo "--- [1] Resource group + red ---"
az group create -n $RG -l $LOC -o table
az network vnet create -g $RG -n $VNET -l $LOC --address-prefix 10.20.0.0/16 --subnet-name snet-app --subnet-prefix 10.20.1.0/24 -o none
az network vnet subnet create -g $RG --vnet-name $VNET -n snet-pg --address-prefixes 10.20.2.0/24 -o none
az network vnet subnet update -g $RG --vnet-name $VNET -n snet-app --delegations Microsoft.Web/serverFarms -o none
az network vnet subnet update -g $RG --vnet-name $VNET -n snet-pg --delegations Microsoft.DBforPostgreSQL/flexibleServers -o none

echo "--- [2] Registrar provider PostgreSQL ---"
az provider register -n Microsoft.DBforPostgreSQL
until [ "$(az provider show -n Microsoft.DBforPostgreSQL --query registrationState -o tsv 2>/dev/null)" = "Registered" ]; do
  echo "  provider aun no registrado, espero 15s..."; sleep 15
done
echo "  provider Registered."

echo "--- [3] DNS privada + PostgreSQL flexible ---"
az network private-dns zone create -g $RG -n $ZONE -o none
az network private-dns link vnet create -g $RG -z $ZONE -n vnet-link -v $VNET -e false -o none
az postgres flexible-server create -g $RG -n $PG -l $LOC --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 16 \
  --admin-user pgadmin --admin-password "$PGPASS" --vnet $VNET --subnet snet-pg --private-dns-zone $ZONE --yes -o none
az postgres flexible-server db create -g $RG -s $PG --name $DBNAME -o none
PGHOST=$(az postgres flexible-server show -g $RG -n $PG --query fullyQualifiedDomainName -o tsv)
echo "  PGHOST=$PGHOST"

echo "--- [4] Storage + App Service (S1, Node 22) ---"
az storage account create -g $RG -n $ST -l $LOC --sku Standard_LRS --kind StorageV2 --min-tls-version TLS1_2 --allow-blob-public-access true -o none
az appservice plan create -g $RG -n $PLAN -l $LOC --is-linux --sku S1 -o none
az webapp create -g $RG -p $PLAN -n $WEB --runtime "NODE:22-lts" -o none

echo "--- [5] VNet integration + endurecer ---"
az webapp vnet-integration add -g $RG -n $WEB --vnet $VNET --subnet snet-app -o none
az webapp update -g $RG -n $WEB --https-only true -o none
az webapp config set -g $RG -n $WEB --min-tls-version 1.2 --ftps-state Disabled --always-on true \
  --startup-file "npx prisma db push --skip-generate && node scripts/prod-seed.mjs && npm run start" -o none

echo "--- [6] Desactivar vnet-route-all (salida a Internet para el build) ---"
az webapp config set -g $RG -n $WEB --vnet-route-all-enabled false -o none
az webapp config appsettings set -g $RG -n $WEB --settings WEBSITE_VNET_ROUTE_ALL=0 -o none

echo "--- [7] App settings ---"
DBURL="postgresql://pgadmin:${PGPASS}@${PGHOST}:5432/${DBNAME}?sslmode=require"
SITEURL="https://${WEB}.azurewebsites.net"
az webapp config appsettings set -g $RG -n $WEB --settings \
  SCM_DO_BUILD_DURING_DEPLOYMENT=true \
  PRE_BUILD_COMMAND="node scripts/set-db-provider.mjs postgresql" \
  DATABASE_URL="$DBURL" \
  SESSION_SECRET="$SESSION_SECRET" \
  ADMIN_USERNAME="admin" \
  ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  DOOR_USERNAME="portero" \
  DOOR_PASSWORD="$DOOR_PASSWORD" \
  NEXT_PUBLIC_SITE_URL="$SITEURL" \
  NEXT_PUBLIC_WHATSAPP="+507 6931-2305" \
  AZURE_OPENAI_ENDPOINT="${AZ_OAI_ENDPOINT:-}" \
  AZURE_OPENAI_API_KEY="${AZ_OAI_KEY:-}" \
  AZURE_OPENAI_DEPLOYMENT="${AZ_OAI_DEPLOYMENT:-}" \
  AZURE_OPENAI_API_VERSION="${AZ_OAI_APIVER:-2024-10-21}" \
  -o none

echo "--- [8] Deploy (zip) ---"
cd ~/app && zip -qr ~/app.zip . -x '.git/*'
az webapp restart -g $RG -n $WEB -o none && sleep 25
az webapp deployment source config-zip -g $RG -n $WEB --src ~/app.zip -o none || echo "(config-zip devolvio error/timeout; el build puede seguir en Kudu)"

echo ""
echo "================= RESUMEN ================="
echo "URL:        $SITEURL"
echo "Recursos:   RG=$RG | WEB=$WEB | PG=$PG | DB=$DBNAME | ST=$ST | PLAN=$PLAN | VNET=$VNET"
echo "PGHOST:     $PGHOST"
echo "Logs Oryx:  https://${WEB}.scm.azurewebsites.net/api/deployments/latest/log"
echo "==========================================="
