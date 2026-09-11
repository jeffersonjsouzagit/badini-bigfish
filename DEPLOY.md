# ============================================
# BADINI BIG FISH - GUIA DE DEPLOY
# ============================================

# ============================================
# ESTRUTURA DO PROJETO
# ============================================
# /var/www/badinibigfish/
# ├── index.html          # Pagina inicial
# ├── produtos.html       # Catalogo de produtos
# ├── produto.html        # Detalhe do produto
# ├── Logo.png            # Logo
# ├── client/             # Arquivos estaticos
# │   └── js/
# │       ├── api.js      # Cliente API
# │       ├── produtos.js # Logica catalogo
# │       └── produto.js  # Logica detalhe
# ├── server/             # Backend API
# │   ├── src/
# │   │   ├── server.js
# │   │   ├── routes/
# │   │   └── middleware/
# │   ├── prisma/
# │   └── .env
# ├── admin/              # Painel administrativo
# └── nginx/              # Configuracao Nginx

# ============================================
# 1. ESCOLHA DO SERVIDOR
# ============================================

## Opcao A: DigitalOcean (Recomendado para iniciantes)
## - Droplet $12/mes (2GB RAM, 1 vCPU, 50GB SSD)
## - URL: https://www.digitalocean.com

## Opcao B: Vultr (Boa alternativa)
## - Compute $6/mes (1GB RAM, 1 vCPU, 25GB SSD)
## - URL: https://www.vultr.com

## Opcao C: AWS EC2 (Para escala)
## - t3.micro (gratuito por 12 meses)
## - URL: https://aws.amazon.com/ec2

# ============================================
# 2. CONFIGURACAO DO SERVIDOR (Ubuntu 22.04)
# ============================================

## Conectar via SSH:
# ssh root@SEU_IP

## Atualizar sistema:
# apt update && apt upgrade -y

## Instalar dependencias:
# apt install -y curl git nginx certbot python3-certbot-nginx

## Instalar Node.js 22 LTS:
# curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
# apt install -y nodejs

## Verificar versoes:
# node -v  # Deve mostrar v22.x
# npm -v

# ============================================
# 3. INSTALAR POSTGRESQL
# ============================================

# apt install -y postgresql postgresql-contrib

## Criar banco de dados:
# su - postgres
# psql
# CREATE USER badini WITH PASSWORD 'sua_senha_segura';
# CREATE DATABASE badini_bigfish OWNER badini;
# GRANT ALL PRIVILEGES ON DATABASE badini_bigfish TO badini;
# \q
# exit

# ============================================
# 4. CLONAR E CONFIGURAR O PROJETO
# ============================================

## Criar diretorio:
# mkdir -p /var/www/badinibigfish
# cd /var/www/badinibigfish

## Clonar repositorio (ou upload via SCP):
# git clone SEU_REPOSITORIO .

## ou upload manual:
# scp -r "C:\Users\Jeff\Desktop\Projetos\Badini Big Fish"/* root@SEU_IP:/var/www/badinibigfish/

## Configurar backend:
# cd server
# npm ci --production
# cp .env.example .env

## Editar .env com nano:
# nano .env

## Configurar Prisma:
# npx prisma generate
# npx prisma migrate deploy
# npm run prisma:seed

## Testar servidor:
# npm start

# ============================================
# 5. CONFIGURAR NGINX (REVERSE PROXY)
# ============================================

## Criar configuracao:
# nano /etc/nginx/sites-available/badinibigfish

## Conteudo:
"""
server {
    listen 80;
    server_name badinibigfish.com.br www.badinibigfish.com.br;

    # Frontend - arquivos estaticos na raiz do projeto
    root /var/www/badinibigfish;
    index index.html;

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin Panel
    location /admin {
        alias /var/www/badinibigfish/admin;
        try_files $uri $uri/ /admin/index.html;
    }

    # Paginas estaticas
    location ~* \.(html|css|js|png|jpg|jpeg|gif|ico|svg|webp|mp4|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Habilitar SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Seguranca
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
"""

## Ativar configuracao:
# ln -s /etc/nginx/sites-available/badinibigfish /etc/nginx/sites-enabled/
# rm /etc/nginx/sites-enabled/default
# nginx -t
# systemctl restart nginx

# ============================================
# 6. CONFIGURAR SSL (HTTPS)
# ============================================

## Instalar Certbot:
# apt install -y certbot python3-certbot-nginx

## Obter certificado:
# certbot --nginx -d badinibigfish.com.br -d www.badinibigfish.com.br

## Seguir instrucoes na tela

## Auto-renovacao:
# certbot renew --dry-run

# ============================================
# 7. CONFIGURAR PM2 (MANTER SERVIDOR RODANDO)
# ============================================

## Instalar PM2:
# npm install -g pm2

## Iniciar servidor:
# cd /var/www/badinibigfish/server
# pm2 start src/server.js --name "badini-api"
# pm2 save
# pm2 startup

## Comandos uteis:
# pm2 status
# pm2 logs badini-api
# pm2 restart badini-api
# pm2 stop badini-api

# ============================================
# 8. CONFIGURAR FIREWALL
# ============================================

## Instalar UFW:
# apt install -y ufw

## Configurar:
# ufw allow 'Nginx Full'
# ufw allow OpenSSH
# ufw enable

## Verificar:
# ufw status

# ============================================
# 9. CONFIGURAR BACKUP AUTOMATICO
# ============================================

## Criar script de backup:
# nano /root/backup.sh

## Conteudo:
"""
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/badinibigfish"

mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -U badini badini_bigfish > $BACKUP_DIR/db_$DATE.sql

# Backup dos arquivos (frontend + backend + admin)
tar -czf $BACKUP_DIR/files_$DATE.tar.gz \
    /var/www/badinibigfish/index.html \
    /var/www/badinibigfish/produtos.html \
    /var/www/badinibigfish/produto.html \
    /var/www/badinibigfish/client \
    /var/www/badinibigfish/server \
    /var/www/badinibigfish/admin \
    /var/www/badinibigfish/Logo.png

# Manter apenas ultimos 7 backups
cd $BACKUP_DIR && ls -t *.sql | tail -n +8 | xargs rm -f
cd $BACKUP_DIR && ls -t *.tar.gz | tail -n +8 | xargs rm -f
"""

## Tornar executavel:
# chmod +x /root/backup.sh

## Agendar diariamente:
# crontab -e
# Adicionar: 0 2 * * * /root/backup.sh

# ============================================
# 10. DOMINIO E DNS
# ============================================

## No registrar do dominio ( Registro.br, GoDaddy, etc):
## Configurar DNS:

## Tipo  | Nome  | Valor
## A     | @     | SEU_IP
## A     | www   | SEU_IP
## CNAME | api   | badinibigfish.com.br

# ============================================
# 11. VERIFICACAO FINAL
# ============================================

## Testar site:
# curl -I https://badinibigfish.com.br
# curl -I https://badinibigfish.com.br/api/health

## Verificar SSL:
# https://www.ssllabs.com/ssltest/

## Verificar seguranca:
# https://securityheaders.com/?q=badinibigfish.com.br

# ============================================
# COMANDOS UTEIS DIARIOS
# ============================================

## Ver status:
# pm2 status
# systemctl status nginx
# systemctl status postgresql

## Ver logs:
# pm2 logs badini-api
# tail -f /var/log/nginx/error.log

## Reiniciar tudo:
# pm2 restart badini-api
# systemctl restart nginx

## Atualizar codigo:
# cd /var/www/badinibigfish
# git pull
# cd server
# npm ci --production
# npx prisma generate
# npx prisma migrate deploy
# pm2 restart badini-api
