#!/usr/bin/env -S node --import tsx/esm
/* eslint-disable header/header */

import type { IBuildOptions } from '../tsdown/types';
import process from 'node:process';
import { build } from '../tsdown/index';

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

    // eslint-disable-next-line antfu/no-top-level-await
    await build(options);
}
