---
title: Docker Phoenix Project Development with Hot Reload 🔥
short: phoenix-docker-hot-reload-development
description: Docker Phoenix Project Development with Hot Reload 🔥
createdAt: 2023-03-06
updatedAt: 2023-03-06
category: elixir
isDraft: false
slug: phoenix-docker-hot-reload-development
author: Amirzhan Aliyev
email: letavocado@proton.me
pin: false
buymeacoffee: https://www.buymeacoffee.com/teamxg
linkedin: https://www.linkedin.com/in/yerlen-zhubangaliyev/
gitlab:
tags:
  - elixir
  - phoenix
  - docker
  - docker-compose
  - hot-reload
image:
  src: "../../assets/elixir+doker+hot-reload-preview.jpg"
  alt: "Glusterfs"
date: "2022-05-06"
versionNumber: "2.0"

license:
  - by
  - nc
language:
  - en
  - ru
  - kk
---

![Nebulous 2.0 Release](../../assets/elixir+doker+hot-reload-preview.jpg)

## [Real-time app] Docker Phoenix Project Development with Hot Reload 🔥

![Development Phoenix project in Docker with hot reload 🔥 cover](//covers/elixir+doker+hot-reload-preview.jpg)

## What is Phoenix?

---

[Phoenix](https://www.phoenixframework.org/) — is a web framework built with the [Elixir](https://elixir-lang.org/) functional programming language. In turn, Elixir is based on Erlang, which uses a [BEAM](https://www.erlang.org/blog/a-brief-beam-primer/) virtual machine and [OTP(Open Telecom Platform)](https://wikipedia.org/wiki/Open_Telecom_Platform). Phoenix is used for building fault-tolerant, low-latency, distributed real-time web applications.

## Installation Phoenix

---

The best official installation [guide](https://hexdocs.pm/phoenix/up_and_running.html).

## Local development in Docker with hot-reload

---

### Add a Dockerfile

1. Create a file named `Dockerfile` based on [elixir](https://hub.docker.com/_/elixir) image, thus helping to avoid the installation of development environments for Elixir and Erlang

WORKDIR — set working directory

```docker
WORKDIR /app
```

Import the necessary files into the working directory

```docker
ADD . /app
```

Update the image and install the following packages:

- `npm` - needed to manage js dependencies
- `build-essential` - meta-packages required for compiling
- `inotify-tools` - Phoenix provides a very handy feature called Live Reloading. As you change your views or your assets, it automatically reloads the page in the browser. In order for this functionality to work, you need a (filesystem watcher)[https://github.com/inotify-tools/inotify-tools/wiki].

```docker
RUN apt-get update && apt-get -y install npm build-essential inotify-tools
```

Install js dependencies inside the `assets` directory

```docker
RUN npm install --prefix ./assets
```

Install local copies of `hex` and `rebar`

- `hex` - the package manager for the Erlang ecosystem
- `rebar` - build tool and package management tool for Erlang
- `--force` - forces installation without a shell prompt; primarily intended for automation in build systems like `make`

```docker
RUN mix local.hex --force && mix local.rebar --force
```

Install dependencies and compile

```docker
RUN mix do deps.get, compile
```

Expose port 4000

```docker
EXPOSE 4000
```

Run a `bash`-script at the root of the project

```docker
CMD ["./dev"]
```

Finally Dockerfile file

```docker
FROM elixir:latest

WORKDIR /app

ADD . /app

RUN apt-get update && apt-get -y install npm build-essential inotify-tools
RUN npm install --prefix ./assets
RUN mix local.hex --force && mix local.rebar --force
RUN mix do deps.get, compile

EXPOSE 4000

CMD ["./dev"]
```

### Add a bash script to run the project

---

Once the project is compiled, you can start an `iex` session inside the project by running the command below. The `-S mix` is necessary to load the project in the interactive shell:

```bash
#!/bin/sh
exec iex -S mix phx.server
```

### Add a docker-compose.yml

---

```yaml
version: "3.9" # use the latest version
services:
  phoenix-app:
    container_name: phoenix-container
    restart: always

    build: . # specify the path to the Dockerfile, in our case it is in the root of the project

    environment:
      - MIX_ENV=dev # set mix environment

    # mount the necessary files that will respond to changes in the code. Required for hot reloading
    volumes:
      - ./assets:/app/assets
      - ./priv:/app/priv
      - ./lib:/app/lib
      - ./config:/app/config
    ports:
      - "4000:4000"

    # `tty: true` и `stdin_open: true` required to interactive shell. Otherwise, iex will throw an error
    tty: true
    stdin_open: true
```

### Conclusions

---

This article shows how to develop `Phoenix` projects in a `Docker` environment with hot reload in practice.
