
## Description

[NeoDrive](https://github.com/ashit1303/NeoDrive) A project to learn a modern professional typescript application and making it scalable using open source projects.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit [ZincSearch](https://zincsearch-docs.zinc.dev/)
- Visit [Nginx](https://nginx.org/en/docs/) 
- Visit [NOIP-DUC](https://my.noip.com/)  
- Visit [Ollama](https://ollama.com/) 
- Visit [MariaDB](https://mariadb.org/documentation/) 
- Visit [Redis](https://redis.io/docs/latest/) 
- Visit [Vector](https://vector.dev/) 
- Visit [VictoriaMetrics](https://github.com/VictoriaMetrics/) 
- Visit [SonicSearch](https://github.com/valeriansaliou/sonic) 
- Visit [Liftbridge](https://github.com/LiftbridgeIO/liftbridge)
- Visit [MongoDB](https://www.mongodb.com/) 
- Visit [GraphQl](https://graphql.org/)
- [MongoDB](Under development) 
- [GraphQl](Under development) 
- [Mailer](Under development)
- [GraphQL](Under development)
- Author - [Ash](https://github.com/ashit1303)

# RoadMap 

- LinkShortener
- FileUploader
- Leetcode Problem Solver
- Liftbridge Integration

## Install core package

```bash
# linux
$ ./install-linux

# termux
$ ./install-termux

```
## Prepare configs

```bash
# Create all conf | log | data | env | initiate.sql
$ ./prep-config
```

## Initiate DB

```bash
# linux
$ sudo mysql -u root -p < ./prep-config

# termux
$ mysql < ./prep-config
```
## Project setup

```bash
$ yarn install
```

## Prepare typeorm models 

```bash
# linux
$ yarn run create-model

```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

# yarn > install pkgs > gen-config > boot > initiatesql > start-project

## License

[LICENCE](https://github.com/ashit1303/NeoDrive/blob/main/LICENSE)
## TO build

