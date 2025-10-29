FROM oven/bun:1 AS base

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Expose port
EXPOSE 3000

# Start
CMD ["bun", "run", "start"]
