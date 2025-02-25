#!/usr/bin/env -S npx tsx
/* eslint-disable header/header */

import type { IBuildOptions } from '../vite';
import process from 'node:process';
import { build } from '../vite';

const argvs = process.argv.slice(2);

const [command, ...args] = argvs;

if (command === 'build') {
    const options: IBuildOptions = {};

    if (args.includes('--skipUMD')) {
        options.skipUMD = true;
    }
    if (args.includes('--cleanup')) {
        options.cleanup = true;
    }
    if (args.includes('--nodeFirst')) {
        options.nodeFirst = true;
    }

    build(options);
}
