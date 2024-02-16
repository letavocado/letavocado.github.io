---
title: Run BDD tests based on Codeception framework in Docker container (part 1)
short: Run BDD tests based on Codeception framework (part 1)
description: It's quite convenient to write BDD tests on the Codeception framework. The framework is quite mature and stable.
createdAt: 2022-03-27
category: codeception
isDraft: false
slug: php-codeception-with-docker
author: Yerlen Zhubangaliyev
email: yerlen@yerlen.com
pin: false
buymeacoffee: https://www.buymeacoffee.com/teamxg
linkedin: https://www.linkedin.com/in/yerlen-zhubangaliyev/
gitlab: https://gitlab.com/devnet.kz/
tags:
  - php
  - codeception
  - docker
image: /images/covers/codeception-logo.svg
license:
  - by
  - nc
  - nd
language:
  - ru
  - en
---

It's quite convenient to write BDD tests on the Codeception framework. The framework is quite mature and stable.

We will cover this site wit tests.

- Create Docker image
- Check API

## What should we have?

- OS macOS or linux/amd64
- Preinstalled docker engine
- Any convenient code editor

Create project `mycodeception`

## Building a Docker Image with Codeception

### Create a Dockerfile at the root of the project

```docker[Dockerfile]
FROM php:8.1-cli

WORKDIR /home/codecept

RUN apt-get update \
    && apt-get install -y wget libzip-dev zlib1g-dev \
    && CFLAGS="$CFLAGS -D_GNU_SOURCE" docker-php-ext-install sockets zip \
    && wget https://getcomposer.org/download/latest-stable/composer.phar \
    && chmod +x composer.phar \
    && mv composer.phar /usr/local/bin/composer \
    && php /usr/local/bin/composer require "codeception/codeception"

RUN useradd codecept -d /home/codecept -s /bin/bash && chown -R codecept.codecept .

USER codecept
```

### Build image

```bash
docker build -t mycodeception/php8.1-cli:latest .
```

Let's check

```bash
docker images | grep mycodeception
```

## Codeception initialization

Create file `.env.local` at the root of the project

```env[.env.local]
API_URL=https://devnet.kz/api-content
SITE_URL=https://devnet.kz
```

Create folder `src` at the root of the project, and we can run docker image to get a dependencies

```bash
docker run -it --rm --name mycodeception -v "$(PWD)/src:/home/codecept" --env-file .env.local mycodeception/php8.1-cli:latest composer install
```

Now we can initialize `codeception` framework (so far only API suite), if terminal asks you for `module-asserts` and other things by default - accept it.
This will create the `tests`

```bash
docker run -it --rm --name mycodeception -v "$(PWD)/src:/home/codecept" --env-file .env.local mycodeception/php8.1-cli:latest php vendor/bin/codecept init api
```

The output will be

```bash
ls -la tests
total 4
drwxr-xr-x 6 codecept codecept 192 Mar 22 13:03 .
drwxr-xr-x 9 root     root     288 Mar 22 13:03 ..
-rw-r--r-- 1 codecept codecept 176 Mar 22 13:03 ApiCest.php
drwxr-xr-x 3 codecept codecept  96 Mar 22 13:03 _data
drwxr-xr-x 3 codecept codecept  96 Mar 22 13:03 _output
drwxr-xr-x 5 codecept codecept 160 Mar 22 13:03 _support
```

## First test on Codeception

Make the `codeception.yml` file look like this

```yaml[codeception.yml]
# suite config
suites:
  api:
    actor: ApiTester
    path:  .
    modules:
      enabled:
        - REST:
            url:     '%API_URL%'
            depends: PhpBrowser
        - PhpBrowser:
            url: '%API_URL%'
            headers:
              Content-Type: application/json
    step_decorators:
      - \Codeception\Step\AsJson
    config:
      PhpBrowser:
        headers:
          Content-Type: application/json

paths:
  tests:   tests
  output:  tests/_output
  data:    tests/_data
  support: tests/_support

settings:
  shuffle: false
  lint:    true

params:
  - env
```

In the `ApiCest.php` file, we can already start writing tests, the first thing we need to do is get a list of articles on the site,
By default there will be content like this

```php[ApiCest.php]
<?php
class ApiCest
{
    public function tryApi(ApiTester $I)
    {
        $I->sendGet('/');
        $I->seeResponseCodeIs(200);
        $I->seeResponseIsJson();
    }
}
```

Make it look like this:

```php[ApiCest.php]
<?php

use Codeception\Scenario;

class ApiCest
{

    public function tryGetIndexAndSettings(ApiTester $I, Scenario $scenario)
    {
        $body = [
            "deep"   => true,
            "text"   => false,
            "sortBy" => [
                [
                    "createdAt" => "desc",
                ],
            ],
            "only"   => [
                "title",
                "path",
                "createdAt",
            ],
        ];

        $I->sendPost('/en', $body);
        $I->seeResponseCodeIs(200);
        $I->seeResponseIsJson();
    }
}

```

Run the first test in the terminal

```bash
docker run -it --rm --name mycodeception -v "$(PWD)/src:/home/codecept" --env-file .env.local mycodeception/php8.1-cli:latest php vendor/bin/codecept run --steps --debug
```

The result of execution will be something like this

```bash
Codeception PHP Testing Framework v4.1.31 https://helpukrainewin.org
Powered by PHPUnit 9.5.19 #StandWithUkraine

Api Tests (1) -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Modules: REST, PhpBrowser
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
ApiCest: Try get index and settings
Signature: ApiCest:tryGetIndexAndSettings
Test: tests/ApiCest.php:tryGetIndexAndSettings
Scenario --
 I send post "/en",{"deep":true,"text":false,"sortBy":[{"createdAt":"desc"}],"only":["title","path","createdAt"]}
  [Request] POST https://devnet.kz/api-content/en {"deep":true,"text":false,"sortBy":[{"createdAt":"desc"}],"only":["title","path","createdAt"]}
  [Request Headers] {"Content-Type":"application/json"}
  [Page] https://devnet.kz/api-content/en
  [Response] 200
  [Request Cookies] []
  [Response Headers] {"x-dns-prefetch-control":["off"],"expect-ct":["max-age=0"],"x-frame-options":["SAMEORIGIN"],"strict-transport-security":["max-age=15552000; includeSubDomains"],"x-download-options":["noopen"],"x-content-type-options":["nosniff"],"x-permitted-cross-domain-policies":["none"],"referrer-policy":["no-referrer"],"x-xss-protection":["0"],"etag":[""169-7IUQ8Bx776JS/URhEuGoQdRUkGw""],"content-type":["application/json; charset=utf-8"],"content-length":["361"],"vary":["Accept-Encoding"],"date":["Sun, 22 May 2022 11:20:07 GMT"],"keep-alive":["timeout=5"],"Content-Type":["text/html"]}
  [Response] [{"title":"How to create a simple storage cluster based on Glusterfs 10 and Ubuntu server 22.04 (Jammy)","createdAt":"2022-04-06T00:00:00.000Z","path":"/en/2022/04/glusterfs-10-cluster"},{"title":"Run BDD tests based on Codeception framework in Docker container (part 1)","createdAt":"2022-03-27T00:00:00.000Z","path":"/en/2022/03/php-codeception-with-docker"}]
 I see response code is 200
 I see response is json
 PASSED

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


Time: 00:01.910, Memory: 10.00 MB

OK (1 test, 3 assertions)
```

Git Repository [https://gitlab.com/devnet.kz/site-codeception-tests](https://gitlab.com/devnet.kz/site-codeception-tests)

There you will also find a Makefile with useful commands.

**In the second part we will extend the tests**

- test execution order
- fixtures

We will also touch on CI/CD Gitlab - we will build this test into the pipeline.

For any questions/clarifications, please email.
