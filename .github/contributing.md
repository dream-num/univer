# Univer Contributing Guide

## Develop

### Install dependencies

Univer requires Node.js >= 18.17.0. We recommend using nvm or fnm to switch between different versions of Node.js.

```shell
git clone http://github.com/dream-num/univer
cd univer

# install package manager pnpm
npm i -g pnpm

# install dependencies
pnmp install

# start Univer sheet
npm run dev:sheet
```

### Plugin development

You can quickly generate plugin template directory using the following command:

```shell
npm run cli
```

## Codestyle

Please refer to our wiki [Codestyle Guideline](https://github.com/dream-num/univer/wiki/Codestyle-Guideline).
