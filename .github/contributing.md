# Univer Contributing Guide

## Develop

### Install dependencies

Univer requires Node.js >= 16.20.0. We recommend using nvm or fnm to switch between different versions of Node.js.

```shell
git clone http://github.com/dream-num/univer
cd univer

# install package manager pnpm
npm i -g pnpm

# install dependencies
pnmp install

# start Univer sheet
npm run start:sheet
```

### Command

Execute a command in a subpackage

```shell
pnpm run --filter  [package name] [command]
```

For example, start the `dev` development mode of the `packages/sheets-plugin-sort` project

```shell
pnpm run --filter @univerjs/sheets-plugin-sort dev

```

### Clean

If you encounter any npm installation problems, please try one-click reinstallation of dependencies first

```shell
npm run clean
```

### Plugin development

You can quickly generate plugin template directory using the following command:

```shell
npm run cli
```

## Codestyle

Please refer to our wiki [Codestyle Guideline](https://github.com/dream-num/univer/wiki/Codestyle-Guideline).