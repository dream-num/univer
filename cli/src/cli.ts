#!/usr/bin/env node

import { Command } from 'commander';
import { build } from './build';
import { create } from './create';
const program = new Command();

program
    .command('build')
    .option('-a, --all', 'Package the core and all plugins together')
    .option('-i, --include <plugins...>', 'List plugins that need to be packaged')
    .option('-e, --exclude <plugins...>', 'List plugins that do not need to be packaged')
    .description('Package the core and plugins together,core and base plugins are packaged by default')
    .action((options) => {
        build(options);
    });

// TODO:check npm package name conflict
program
    .command('create [inner]')
    .description('Create a Univer plugin from a template')
    .action(() => {
        create();
    });

program.parse(process.argv);
