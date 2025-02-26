
## Description

[NeoDrive](https://github.com/ashit1303/NeoDrive) A project to learn a typescript application and making it scalable using open source projects.

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
- [Neo4j](Under development)
- [OLAP-DuckDB](Under development)
- Author - [Ash](https://github.com/ashit1303)

# RoadMap 

- LinkShortener - Done
- FileUploader - Done
- Leetcode Problem Solver - Done
- Scripts(cron -update quesitons/ find solutions) airflow
- Liftbridge Integration(Comms)
- LLM integration
- reduce memory consumption
- graphql
- understanding graphDb

- jest pactun for testing e2e writing test case 
- circle ci
- github actions
- Tests (search)(Sonic) (get acronyms)(llms)(mappings) 
- Docker podman for containerize dependency 
- 

## Docker prerequisites

```bash
$ podman compose up -d

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



Separate project 
- Remove duplicate partners
- remove duplicate centers
- remove diagnostics tests
- put tests on sonic for quick search
- partners -> center(lat,long) -> tests -> prices
- partners -> pincodes -> tests -> prices
- grouping of pincodes for a particular partner based on lat, long
- users -> lat, long -> nearby pincodes using Approx lat, long -> partners/centers -> tests availability -> prices
