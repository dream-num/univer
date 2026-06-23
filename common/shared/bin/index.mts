#!/usr/bin/env -S node --experimental-strip-types

import type { IBuildOptions } from '../tsdown/types.ts';
import process from 'node:process';
import { buildPresetPackage, preparePresetPackage } from '../preset-build/index.ts';
import { build } from '../tsdown/index.ts';

interface IPresetCliBuildOptions {
    cleanup?: boolean;
    tsdownConfigPath?: string;
}

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

if (command === 'preset') {
    const [presetCommand, ...presetArgs] = args;
    if (!presetCommand) {
        throw new Error('Missing preset subcommand. Expected "prepare" or "build".');
    }

    if (presetCommand === 'prepare') {
        preparePresetPackage();
    } else if (presetCommand === 'build') {
        const options: IPresetCliBuildOptions = {};

        if (presetArgs.includes('--cleanup')) {
            options.cleanup = true;
        }

        const configIdx = presetArgs.indexOf('--config');
        if (configIdx !== -1 && presetArgs[configIdx + 1]) {
            options.tsdownConfigPath = presetArgs[configIdx + 1];
        }

        // eslint-disable-next-line antfu/no-top-level-await
        await buildPresetPackage(options);
    } else {
        throw new Error(`Unknown preset subcommand "${presetCommand}". Expected "prepare" or "build".`);
    }
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

    const configIdx = args.indexOf('--config');
    if (configIdx !== -1 && args[configIdx + 1]) {
        options.tsdownConfigPath = args[configIdx + 1];
    }

    // eslint-disable-next-line antfu/no-top-level-await
    await build(options);
}
