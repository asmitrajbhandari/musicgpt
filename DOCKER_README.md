# Docker Setup

This repository includes Docker configuration for easy deployment and development.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Environment variables configured

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Firebase Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Firebase Admin Configuration
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_STORAGE_BUCKET=your_project.appspot.com
```

### Docker Commands

#### Development Mode
```bash
# Build and run with docker-compose
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f app
```

#### Production Mode
```bash
# Build the Docker image
docker build -t musicgpt .

# Run the container
docker run -p 3000:3000 --env-file .env musicgpt
```

#### Stop Services
```bash
# Stop docker-compose services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Dockerfile Features

### Multi-stage Build
- **Base**: Node.js 18 Alpine for minimal size
- **Deps**: Install dependencies only when needed
- **Builder**: Build the application
- **Runner**: Production-ready runtime

### Security Features
- Non-root user (nextjs)
- Minimal attack surface
- Proper file permissions

### Optimization
- Layer caching for faster builds
- Standalone output for smaller images
- .dockerignore for context optimization

## Docker Compose Services

### App Service
- **Main Next.js Application**
- Port: 3000
- Environment variables from .env file
- Restart policy: unless-stopped

### Socket Server Service
- **Real-time Communication Server**
- Port: 3001
- Depends on app service
- Restart policy: unless-stopped

## Deployment Options

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up -d --build
```

### Option 2: Docker Swarm
```bash
docker stack deploy -c docker-compose.yml musicgpt
```

### Option 3: Kubernetes
```bash
# Create k8s manifests from docker-compose
kompose convert -f docker-compose.yml
kubectl apply -f ./k8s/
```

## Health Checks

The Docker container includes built-in health checks:
- HTTP endpoint: `http://localhost:3000/api/health`
- Check interval: 30s
- Timeout: 10s
- Retries: 3

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clean build
   docker-compose down -v
   docker system prune -f
   docker-compose up --build
   ```

2. **Port Conflicts**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Use different port
   docker-compose up --scale app=1 --force-recreate
   ```

3. **Environment Variables**
   ```bash
   # Verify .env file
   docker-compose config
   ```

### Logs and Debugging
```bash
# View application logs
docker-compose logs app

# View socket server logs
docker-compose logs socket-server

# Enter container for debugging
docker-compose exec app sh
```

## Performance Optimization

### Build Optimization
- Use `.dockerignore` to exclude unnecessary files
- Leverage Docker layer caching
- Use multi-stage builds

### Runtime Optimization
- Enable gzip compression
- Use Redis for session storage
- Configure proper memory limits

### Production Tips
```bash
# Set resource limits
docker-compose up -d --scale app=2 --memory=2g

# Use production-ready images
docker-compose -f docker-compose.prod.yml up -d
```

## Security Considerations

- Store secrets in environment variables or Docker secrets
- Use non-root containers
- Regularly update base images
- Scan images for vulnerabilities
```bash
# Scan for security issues
docker scan musicgpt:latest
```

## Monitoring

### Basic Monitoring
```bash
# Container resource usage
docker stats

# Container health status
docker-compose ps
```

### Advanced Monitoring
Consider integrating with:
- Prometheus + Grafana
- ELK Stack
- Docker health checks
- External monitoring services
