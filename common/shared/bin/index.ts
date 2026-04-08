#!/usr/bin/env -S node --import tsx/esm
/* eslint-disable header/header */

import type { IBuildOptions } from '../tsdown/types';
import process from 'node:process';
import { build } from '../tsdown/index';

const argvs = process.argv.slice(2);
const [command, ...args] = argvs;

function collectOptionValues(argv: string[], optionName: string) {
    const values: string[] = [];

    for (let index = 0; index < argv.length; index++) {
        if (argv[index] !== optionName) {
            continue;
        }

        const next = argv[index + 1];
        if (!next || next.startsWith('--')) {
            continue;
        }

        values.push(...next.split(',').map((value) => value.trim()).filter(Boolean));
        index++;
    }

    return [...new Set(values)];
}

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

    const ignorePackages = collectOptionValues(args, '--ignorePackages');
    if (ignorePackages.length > 0) {
        options.ignorePackages = ignorePackages;
    }

    // eslint-disable-next-line antfu/no-top-level-await
    await build(options);
}
