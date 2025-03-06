# Step-by-Step Guide: NestJS on Contabo VPS

This guide will walk you through the process of deploying your existing NestJS project on a Contabo VPS, setting up domains, configuring SSL, installing a database, and creating a backend subdomain.

## Prerequisites

Before starting, ensure you have:

- A Contabo VPS with Ubuntu installed
- A registered domain name
- SSH access to your VPS
- Git repository for your NestJS project

## Step 1: Initial VPS Setup

### Connect to your Contabo VPS via SSH:

```sh
ssh root@your_vps_ip
```

### Update and upgrade the system:

```sh
sudo apt update && sudo apt upgrade -y
```

### Install essential tools:

```sh
sudo apt install -y curl git
```

## Step 2: Install Node.js and npm

### Install Node.js and npm:

```sh
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Verify the installation:

```sh
node -v
npm -v
```

## Step 3: Install Angular CLI and NestJS CLI

### Install Angular CLI globally:

```sh
npm install -g @angular/cli@18.0.3
```

### Install NestJS CLI globally:

```sh
npm install -g @nestjs/cli
```

## Step 4: Clone and Set Up Your Project


### Clone your NestJS project:

```sh
git clone https://github.com/your-repo/nestjs-project.git
cd nestjs-project
npm install
```

## Step 5: Build Your Project

### Build the NestJS project:

```sh
cd /path/to/nestjs-project
npm run build
```

## Step 6: Domain Configuration

1. Log in to your domain registrar's website.
2. Navigate to the DNS settings.
3. Create an A record pointing your domain (e.g., example.com) to your VPS's public IP address.
4. Create an A record for the backend subdomain (e.g., api.example.com) pointing to the same IP address.

## Step 7: Install and Configure Nginx

### Install Nginx:

```sh
sudo apt install nginx -y
```

#### Add the following configuration:

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Create a new configuration file for your NestJS backend:

```sh
sudo nano /etc/nginx/sites-available/nestjs-backend
```

#### Add the following configuration:

```nginx
server {
    listen 80;
    server_name api.your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable the configurations:

```sh
sudo ln -s /etc/nginx/sites-available/nestjs-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: SSL Configuration with Let's Encrypt

### Install Certbot and the Nginx plugin:

```sh
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain and install SSL certificates:

```sh
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
sudo certbot --nginx -d api.your_domain.com
```

### Set up auto-renewal:

```sh
sudo certbot renew --dry-run
```

## Step 9: Database Installation (PostgreSQL)

### Install PostgreSQL:

```sh
sudo apt install postgresql postgresql-contrib -y
```

### Create a new database and user:

```sh
sudo -i -u postgres
createdb your_database
createuser --interactive --pwprompt
psql
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
\q
exit
```

## Step 10: Configure NestJS to Use the Database

### Install dependencies:

```sh
cd /path/to/nestjs-project
npm install @nestjs/typeorm typeorm pg
```

### Update your `app.module.ts` file:

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'your_user',
      password: 'your_password',
      database: 'your_database',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

## Step 11: Set Up Process Management with PM2

### Install PM2 globally:

```sh
sudo npm install -g pm2
```

### Start the Angular SSR application:

```sh
cd /path/to/angular-ssr-project
pm2 start dist/server/main.js --name angular-ssr
```

### Start the NestJS application:

```sh
cd /path/to/nestjs-project
pm2 start dist/main.js --name nestjs-backend
```

### Save the PM2 process list:

```sh
pm2 save
pm2 startup systemd
```

## Conclusion

You have successfully deployed your NestJS project on a Contabo VPS, set up domains, configured SSL certificates, installed a PostgreSQL database, and created a backend subdomain. Keep your system updated and consider monitoring solutions for better performance and security.
