---
title: Production Ready Docker for Laravel
excerpt: A guide to getting your Laravel application up and running in production with Docker, Caddy, and a few other tools.
publishDate: 2024-11-13
tags:
  - docker
  - laravel
isFeatured: true
seo:
  image:
    src: /post-1-beach.jpg
    alt: Two wicker chairs with covers sitting on the beach, in black and white
---

![Cover image](/post-1-beach.jpg)

There are endless tutorials on getting your development environment set up with Docker. The Laravel community has lots of great options like [Sail](https://github.com/laravel/sail), or [Laradock](https://laradock.io/).

There are very few tutorials about how to go live with a Docker setup. Here I _won't_ be talking about Kubernetes, but this does get you one step closer if that's the direction you're looking to take. I struggled to find specific instructions for a _relatively_ simple set up for using Docker on a production server.

I also won't cover Docker installation, and will assume you, the reader, have a basic understanding of Docker usage. If you do want hear more about how I run Docker on my local environment, [contact me](/contact) and let me know!

## Objective
What we're trying to do here is build an image for Laravel that can be used to deploy your application to a simple VPC along with the rest of your application's stack. We also want some of the nice creature comforts like self deploying updates, and automatic SSL certificates.

Another assumption we're making here is that the application doesn't receive tens of thousands of unique visits per day. If that is the case, definitely reach for a more scaleable infrastructure setup.

## Docker Setup
Rather than re-invent the wheel, we're going to leverage some [existing images](https://github.com/serversideup/docker-php) from the team at [ServerSideUp](https://serversideup.net/). These images are super robust and well thought out from my point of view. I've used them to run development environments for a while on projects like [SessionTome](https://github.com/DnD-Montreal/session-tome).

Because the base image takes so much into consideration, it means that our `Dockerfile` can literally be as simple as:

```Dockerfile
FROM serversideup/php:8.3-fpm-nginx-bookworm

COPY --chown=www-data:www-data . /var/www/html

# Install composer dependencies for production  
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader --prefer-dist --classmap-authoritative
```

### Compiling JavaScript
Again, there's an assumption here, and it's that you're not using any JavaScript that needs to be compiled. If you _do_ need to build front-end files (which is very likely) then we're looking at something marginally more complex:

```Dockerfile
# Adjust NODE_VERSION as desired  
ARG NODE_VERSION=23.1.0  
FROM node:${NODE_VERSION}-slim as build  

WORKDIR /app  

# Set production environment  
ENV NODE_ENV="production"  

# Install packages needed to build node modules  
RUN apt-get update -qq && \  
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3  

# Install node modules  
COPY package-lock.json package.json ./  
RUN npm ci --production  

# Copy application code  
COPY . .  

# Build application  
RUN npm run build  

# Remove development dependencies  
RUN npm prune --omit=dev  


FROM serversideup/php:8.3-fpm-nginx-bookworm

COPY --chown=www-data:www-data --from=build /app /var/www/html  

# Install composer dependencies for production  
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader --prefer-dist --classmap-authoritative
```

Here we simply have a throw-away build which will compile the front-end assets so that we can copy the built files over to our runtime image. Doing this in 2 steps will mean our final image will be smaller and have fewer dependencies that could potentially be exploited.

### Custom Entrypoint Scripts
The ServerSideUp base container image employs some neat tricks to allow users to [modify their entrypoint](https://serversideup.net/open-source/docker-php/docs/customizing-the-image/adding-your-own-start-up-scripts#entrypoint-script-requirements). Basically, anything in the container at the directory `/etc/entrypoint.d` will get run at startup. This means adding a folder to the root of the project (or anywhere you'd like, honestly) and copying it to the appropriate directory with the correct permissions in the container will ensure they run at startup.

All that needs to happen, then, is add the appropriate step in the `Dockerfile`:

```Dockerfile
FROM serversideup/php:8.3-fpm-nginx-bookworm  
  
COPY --chmod=755 ./entrypoint.d/ /etc/entrypoint.d/

# ... Everything else
```

and then create any scripts you'd like to run such as `./entrypoint.d/01-startup.sh`:

```bash
php artisan migrate --force  
php artisan storage:link  
php artisan optimize
```

### Building the Image
Once the Dockerfile is configured properly, the image should be built and pushed to a container registry such that it can be accessed by your server. To build the image run the following command:

```bash
docker build -t IMAGE_NAME .
```


It's important to note that this image will copy your project's entire directory into the container, so be sure to clear any sensitive information out of files like the `.env`. When running these images in production files like the `.env` can be bind-mounted to match the environment. Take advantage of the `.dockerignore` file to avoid leaking any secret local files into production images, or better yet, run builds in a CI/CD environment.

Once you have a successful build, you can push it to a container registry, like the [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) (GHCR). This is especially convenient if the build is happening in GitHub Actions, [since you'll be able to push the image fairly easily](https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions#upgrading-a-workflow-that-accesses-a-registry-using-a-personal-access-token).

To tag, and push the image to GHCR run the following commands, in order:

```bash
docker images # Look for the newly built image's ID.
docker tag IMAGE_ID ghcr.io/NAMESPACE/IMAGE_NAME:latest
docker push ghcr.io/NAMESPACE/IMAGE_NAME:latest
```

## Running the Image
With the image pushed to a container registry, like GHCR, the application can be started with a simple `docker run -p 80:8080 -p 443:8443 ghcr.io/NAMESPACE/IMAGE_NAME:latest`, where `NAMESPACE` is your GitHub user name, and `IMAGE_NAME` is the name of the image on GHCR.

Now, a singular Nginx container does not a running Laravel application make. At the very least we'll need a Database of some sort, like MySql. If the goal here is to run this on a single VPS, like a [Digital Ocean Droplet](https://m.do.co/c/1937d5e39a97) (referral link), then the simplest approach would be to just run these services in a docker compose stack.

Simply create a folder in the home directory for your app with the following `compose.yml` file in it. Then be sure to drop an accompanying `.env` file next to it with all the `DB_*` values in it, as well as anything else the Laravel application would need.

```yml
services:
  app:
    image: ghcr.io/NAMESPACE/IMAGE_NAME
    container_name: app
    volumes:
      - .env:/var/www/html/.env
    ports:
      - "80:8080"
      - "443:8443"
    networks:
      - web-public
    depends_on:
      mysql:
        condition: service_healthy
  
  mysql:
    image: mysql
    restart: "unless-stopped"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT}:3306"
    networks:
      - web-public
    volumes:
      - mysql-db:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin" ,"ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

networks:
  web-public:
    driver: bridge
    external: true

volumes:
  mysql-db:
```

Here we define an external `web-public` Docker network so before we try to start our stack we'll need to create that with `docker network create web-public`. Since this application is running on a docker network, we can even (and should, in fact) refer to servers by their name in the stack. This means in the `.env`, we can set the value `DB_HOST=mysql`, referring to the service name in the above compose stack.

After all that, run `docker compose up -d` in the directory and the application should come up and be running.

### Automatic Updates
Obviously the application will change over time, and while there's nothing wrong with pulling the newest image and restarting the container, it would be nice if that happened automatically, though. Luckily there's a nice process we can add to our service stack to simplify this, called [Watchtower](https://github.com/containrrr/watchtower). This process can hook into the docker socket, and trigger docker to download the newest version of an image, and run it.

All that's needed is to add the following service to the `docker-compose.yml` file we made earlier:
```yaml
services:
# ... Other services
  watchtower:
    image: containrrr/watchtower
    environment:
      - TZ=America/New_York
      - WATCHTOWER_POLL_INTERVAL=3600
      - WATCHTOWER_CLEANUP=true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped
```

Now whenever a new image is pushed to the `latest` tag on GHCR, Watchtower should eventually detect this and update the running image to that version. By default, Watchtower checks for new images every 24 hours, but this can be changed via [the poll interval](https://containrrr.dev/watchtower/arguments/#poll_interval). In the example above the poll interval is set to 1 Hour (3600 seconds)

## SSL Certificates
The above configuration will work, though, we're missing one last essential piece for this to really be ready for production, SSL certificates. While the application _is_ exposed on port 443, there currently isn't a valid certificate for the application. This means that if we try to hit this application via `https://` we'll get a "Secure Connection Failed" error. The ServerSideUp image we used as our base _does_ allow users to [supply their own certificate](https://serversideup.net/open-source/docker-php/docs/customizing-the-image/configuring-ssl#providing-your-own-certificate), but ideally, our application will simply get these certificates on it's own.

[Caddy](https://caddyserver.com/) is particularly good at this. It can [act as a reverse proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy) and automatically provisions an SSL certificate. We'll make a couple changes to the `app` service, particularly change the exposed ports to their original ones, and then add a Caddy service using the [official image](https://hub.docker.com/_/caddy).

```yaml
services:
  app:
    # ... more settings
    ports:
      - "8080:8080"
      - "8443:8443"

# ... Other services
  caddy:
    image: caddy:latest
    restart: unless-stopped
    container_name: caddy
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - web-public
    depends_on:
	  - app

volumes:
# ... Existing volumes
  caddy_data:
    external: true
  caddy_config:
```

Like before we're defining an external volume, called `caddy_data` where we store the SSL certs, so before we can start this service we'll need to create that with the command `docker volume create caddy_data`

You might have also noticed that we're also mounting a `Caddyfile` in the above container. Caddy has a super simple notation for its config files. Here we define what email should be the contact for the SSL cert, and then point a domain of our choosing to the particular service and ports via the reverse proxy  directive.

```Caddyfile
{
    email user@example.com
}

example.com {
    reverse_proxy app:8080
}
```

With TLS enabled you may get mixed content warnings when try to load Vite assets, this is because Vite is un-aware of the SSL certificates that have been issued by Caddy.  To fix this, add `ASSET_URL=https://example.com` to the `.env`.

## Going Further
To go beyond this, and add better scaling we'd likely need to employ some level of orchestration, like [Docker Swarm](https://docs.docker.com/engine/swarm/), or [Kubernetes](https://kubernetes.io/). Both of these are definitely a bag of worms on in their own right, so i'll defer that information to a future blog post. There is also the option to run the application as a task in [AWS' ECS on Fargate or EC2 instances](https://aws.amazon.com/ecs/), along with an [RDS instance](https://aws.amazon.com/rds/) for your database. This can get expensive and complex very quickly as well, though.

In the end, the choice is yours. I always caution developers against running to the highest possible scaling available until its absolutely needed. There's a high amount of complexity and maintenance burden associated with these tools, and reaching for them too early could seriously bog down development.

Another nice addition we could explore is adding zero downtime deployments so that when a new image is downloaded we can start a new separate container, and gracefully stop the previous one. Since we're using a reverse proxy this should in theory be possible by setting Caddy to redirect traffic to the new container before stopping the old one. That way users wouldn't experience minimal downtime.

## Resources

During the process of researching this post, I referenced tons of different sources of information. i'd be remiss if i didn't list them here:

- [ServerSideUp/php image documentation pages](https://serversideup.net/open-source/docker-php/docs)
- [GitHub Docs: Working with the Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Watchtower Docs](https://containrrr.dev/watchtower)
- [Blue Hippo: Reverse Proxy And Auto SSL Using Caddy And Docker Compose](https://www.youtube.com/watch?v=qj45uHP7Jmo)

I've also collected all the complete files for this post into [a Gist](https://gist.github.com/m-triassi/7398dcd31caf6de97ebb95a878abd4b5), for convenience.
