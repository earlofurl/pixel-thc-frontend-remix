# Base node image.
FROM node:18-alpine as base

# Set for base and all layer that inherit from it.
ENV NODE_ENV=production

# Install all node_modules, including dev dependencies.
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json ./
RUN npm install --production=false

# Setup production node_modules.
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

# Build the app.
FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint.
FROM base

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/public /myapp/public
ADD . .

CMD ["npm", "start"]
###################
# BUILD FOR LOCAL DEVELOPMENT
###################

# stage build
#FROM node:18-alpine AS development
#
## set working directory
#WORKDIR /app
#
## Copy application dependency manifests to the container image.
## A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
## Copying this first prevents re-running npm install on every code change.
#COPY --chown=node:node package*.json ./
#
## Install app dependencies using the `npm ci` command instead of `npm install` for clean install
#RUN npm ci
#
## Set NODE_ENV environment variable
#ENV NODE_ENV development
#
## Bundle app source
#COPY --chown=node:node . .
#
## remove potential security issues
#RUN npm audit fix
#
## build SvelteKit app
#RUN npm run build
#
## Use the node user from the image (instead of the root user)
#USER node
