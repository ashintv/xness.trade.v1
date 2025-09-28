# XnessTrade v1 - Real-time Trading Engine

A high-performance cryptocurrency trading platform built with TypeScript, Redis, and MongoDB. This monorepo contains a real-time trading engine, API server, and price polling service for handling cryptocurrency trades.

## 🏗️ Architecture Overview

This project consists of three main services that work together to provide a complete trading platform:

- **API Server (`app-api`)**: RESTful API for user management, trading operations, and balance management
- **Trading Engine (`engine`)**: Core trading logic processor that handles order matching and execution
- **Price Poller (`price-poller`)**: Real-time price data collection from external exchanges

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (>= 18.0.0)
- **pnpm** (>= 9.0.0)
- **Redis** (>= 6.0.0)
- **MongoDB** (>= 5.0.0)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd xness.trade.v1
pnpm install
```

### 2. Setup External Services

#### Redis Installation & Setup

**macOS (using Homebrew):**
```bash
# Install Redis
brew install redis

# Start Redis server
brew services start redis

# Or run Redis manually
redis-server
```

**Ubuntu/Debian:**
```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping
```

**Docker (Alternative):**
```bash
# Run Redis in Docker container
docker run -d --name redis-server -p 6379:6379 redis:latest

# Verify connection
docker exec -it redis-server redis-cli ping
```

#### MongoDB Installation & Setup

**macOS (using Homebrew):**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Or run MongoDB manually
mongod --config /usr/local/etc/mongod.conf
```

**Ubuntu/Debian:**
```bash
# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Docker (Alternative):**
```bash
# Run MongoDB in Docker container
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Verify connection
docker exec -it mongodb mongosh
```

### 3. Build All Services

```bash
# Build all applications and packages
pnpm build
```

### 4. Development Mode

#### Start All Services in Development Mode

```bash
# Start all services concurrently
pnpm dev
```

#### Start Individual Services

**API Server:**
```bash
cd apps/app-api
pnpm dev
```

**Trading Engine:**
```bash
cd apps/engine
pnpm dev
```

**Price Poller:**
```bash
cd apps/price-poller
pnpm dev
```

## 🔧 Service Details

### API Server (`app-api`)
- **Port**: 3000
- **Purpose**: Handles HTTP requests for user authentication, trading operations, and balance management
- **Dependencies**: Redis (for queues), JWT authentication
- **Endpoints**:
  - `/api/v1/user/*` - User management
  - `/api/v1/trade/*` - Trading operations
  - `/api/v1/balance/*` - Balance management
  - `/health` - Health check

**Start Command:**
```bash
cd apps/app-api
pnpm dev
```

### Trading Engine (`engine`)
- **Purpose**: Core trading logic processor that handles order matching and execution
- **Dependencies**: Redis (for real-time communication), MongoDB (for trade storage)
- **Features**:
  - Real-time order processing
  - Trade snapshot storage
  - Price update handling
  - Order matching algorithm

**Start Command:**
```bash
cd apps/engine
pnpm dev
```

### Price Poller (`price-poller`)
- **Purpose**: Collects real-time price data from external exchanges (Backpack Exchange)
- **Dependencies**: Redis (for publishing price updates)
- **Supported Assets**: BTC, ETH, SOL
- **Update Frequency**: 100ms intervals

**Start Command:**
```bash
cd apps/price-poller
pnpm dev
```

## 📦 Package Structure

### Applications (`apps/`)
- `app-api/` - REST API server
- `engine/` - Trading engine service
- `price-poller/` - Price data collection service

### Shared Packages (`packages/`)
- `backend-common/` - Shared utilities (Redis client, mail service)
- `types/` - TypeScript type definitions and schemas
- `utils/` - Utility functions (decimal conversion, etc.)
- `ui/` - Shared UI components
- `eslint-config/` - ESLint configurations
- `typescript-config/` - TypeScript configurations

## 🔄 Data Flow

1. **Price Poller** connects to Backpack Exchange WebSocket and receives real-time price updates
2. **Price Poller** publishes price updates to Redis stream `engine_input`
3. **Trading Engine** consumes price updates and processes pending orders
4. **API Server** receives trade requests and communicates with the engine via Redis
5. **Trading Engine** stores completed trades in MongoDB
6. **API Server** provides real-time trade status updates to clients

## 🛠️ Available Scripts

```bash
# Development
pnpm dev                    # Start all services in development mode
pnpm build                  # Build all packages and applications
pnpm lint                   # Run ESLint on all packages
pnpm format                 # Format code with Prettier
pnpm check-types            # Type check all TypeScript files

# Testing
pnpm test                   # Run tests across all packages
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017/xnessengine

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_COOKIE_SECRET=your-jwt-cookie-secret

# API Configuration
API_PORT=3000
```

### Redis Streams

The application uses Redis Streams for real-time communication:
- `engine_input` - Price updates and trading commands
- Queue management for order processing

### MongoDB Collections

- `tradesnapshots` - Historical trade data and snapshots
- User balances and order history

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Test specific service
cd apps/engine
pnpm test
```

## 🚀 Production Deployment

### Build for Production

```bash
# Build all services
pnpm build

# The built files will be in each app's dist/ directory
```

### Production Environment Setup

1. **Redis Cluster**: Set up Redis cluster for high availability
2. **MongoDB Replica Set**: Configure MongoDB replica set for data redundancy
3. **Load Balancer**: Use nginx or similar for API load balancing
4. **Process Manager**: Use PM2 or similar for process management

### Docker Deployment

```bash
# Build Docker images for each service
docker build -f apps/app-api/Dockerfile -t xness-api .
docker build -f apps/engine/Dockerfile -t xness-engine .
docker build -f apps/price-poller/Dockerfile -t xness-poller .

# Run with docker-compose
docker-compose up -d
```

## 🐛 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Check if Redis is running
   redis-cli ping
   
   # Start Redis if not running
   brew services start redis  # macOS
   sudo systemctl start redis-server  # Linux
   ```

2. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   mongosh
   
   # Start MongoDB if not running
   brew services start mongodb/brew/mongodb-community  # macOS
   sudo systemctl start mongod  # Linux
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

4. **TypeScript Build Errors**
   ```bash
   # Clean build cache
   npx turbo clean
   
   # Rebuild everything
   pnpm build
   ```

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
``