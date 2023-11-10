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

### Debugging

We provided some Visual Studio Code (vscode) tasks to help you debug in vscode.

After stating dev server, you can launch Edge or Chrome instance and debug in vscode.

![image](https://github.com/dream-num/univer/assets/12122021/25da436c-2155-4ea0-8646-ff3b3dc23112)


## Code Style

### Source Code Organization

The file structure of a plugin should be organized as follows:

```
|- common/
|- models/
|- services/
|- commands/
  |- commands/
  |- mutations/
  |- operations/
|- controllers/
|- views/
  |- components/
  |- parts/
|- plugin.ts
|- index.ts
```

There are some limits on what paths could a file import from.

* common cannot import file in other folders
* models can only import files from common
* services can only import files from models and common
* commands can only import files from common, models and services

During the refactoring process, it is recommended to remove legacy folders such as `Enum`, `Interface`, `Basics`, and `Shared`.

Avoid creating barrel imports (index.ts) unless it is the main root index.ts file of a plugin.

### Naming Conventions

To ensure code quality and consistency, please adhere to the following guidelines:

- Use kebab-case for both file names and folder names. If the file contains a React component, it should be in capital camelCase.
- Folder names should be in plural format, e.g. `SheetTab.tsx`.
- Interfaces should be named starting with a capital "I".
- Resolve all ESLint issues that are identified in the code.
- Do use conventional type names including .service, .controller, .menu, .command, .mutation, and .operation. Invent additional type names if you must but take care not to create too many.

### Clear code

> Programs are meant to be ready by humans and only icidentally for computers to execute.

* Do not expose properties or methods those are not necessary to be public.
* Group related methods or properties together. Do not always use blank lines to separate them.
* Keep your concepts consistent by naming your variables consistently.

