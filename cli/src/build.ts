#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import shell from 'shelljs';
import { FgGreen, FgRed, Reset } from './utils/color';
const execa = require('execa');
import { renderContent } from './utils/template';
import { generateRandomId } from './utils/tool';
import { IEventBus } from './utils/event-bus';
import { exec } from 'child_process';

// TODO 提供clear目录方法，用于下载完后删除项目
// dynamic 模式

interface IOption {
    all?: boolean;
    include?: string[];
    exclude?: string[];
}

export interface IBuildJson {
    [key: string]: string;
}

export interface IObj {
    msg: string;
}

type PublishType = [IObj, number];

const defaultBuildList: IBuildJson = {
    filter: '//',
    sort: '//',
    alternatingColors: '//',
    comment: '//',
};

const allBuildList: IBuildJson = {
    filter: ' ',
    sort: ' ',
    alternatingColors: ' ',
    comment: ' ',
};

const CURR_DIR = process.cwd();

interface ILibOptions {
    eventBus: IEventBus;
    buildId: string;
}

export function build(options: IOption, libOptions?: ILibOptions) {
    return new Promise((resolve, reject) => {
        const buildList: IBuildJson = filterBuild(options);
        const { eventBus, buildId } = libOptions || {};
        // When we provide nodejs interface, support library mode, create a new project directory with a random name to prevent directory conflicts from running by multiple users at the same time.
        const id = buildId ? buildId : '';
        const randomFolderName = 'univer-custom-build-' + id;

        eventBus?.publish<PublishType>('progress', { msg: 'Pull template files' }, 0.1);

        copyTemplate(randomFolderName);

        eventBus?.publish<PublishType>('progress', { msg: 'Update custom configuration' }, 0.2);

        updateEntry(buildList, randomFolderName);

        eventBus?.publish<PublishType>('progress', { msg: 'Install dependencies' }, 0.3);

        buildScript(resolve, reject, randomFolderName, eventBus);
    });
}

function filterBuild(options: IOption): IBuildJson {
    const { all, include, exclude } = options;
    let filterBuildList: IBuildJson = defaultBuildList;

    if (all) {
        filterBuildList = allBuildList;
    }

    if (include) {
        filterBuildList = defaultBuildList;
        include.forEach((plugin) => {
            if (plugin in defaultBuildList) {
                filterBuildList[plugin] = ' ';
            }
        });
    }
    if (exclude) {
        filterBuildList = allBuildList;
        exclude.forEach((plugin) => {
            if (plugin in allBuildList) {
                filterBuildList[plugin] = '//';
            }
        });
    }

    return filterBuildList;
}

function copyTemplate(folderName: string) {
    const templatePath = path.join(__dirname, 'templates/univer-custom-build');
    copyFolderRecursiveSync(templatePath, CURR_DIR);
    fs.rename(path.join(CURR_DIR, 'univer-custom-build'), path.join(CURR_DIR, folderName), () => {});
}

function updateEntry(json: IBuildJson, folderName: string) {
    const entryFolder = path.join(CURR_DIR, folderName);
    const entryFile = path.join(entryFolder, 'index-template.ts');

    // read file content and transform it using template engine
    let contents = fs.readFileSync(entryFile, 'utf8');

    contents = renderContent(contents, json);

    // write file to destination folder
    let writePath = path.join(entryFolder, 'src/index.custom.ts');
    fs.writeFileSync(writePath, contents, 'utf8');
}

async function buildScript(resolve: Function, reject: Function, folderName: string, eventBus?: IEventBus) {
    shell.cd(folderName);
    // execa('cd', ['univer-custom-build'], { stdio: 'inherit' })
    // The host environment may be production, which will cause development dependencies to fail to be installed, reference https://docs.npmjs.com/cli/v8/commands/npm-install
    await execa('npm', ['i', '--production=false', '--prefer-offline'], { stdio: 'inherit' });

    eventBus?.publish<PublishType>('progress', { msg: 'Build source code' }, 0.8);

    try {
        await execa('npm', ['run', 'build'], { stdio: 'inherit' });
        console.log(`\n${FgGreen}Custom build success!${Reset} \n`);
        eventBus?.publish<PublishType>('progress', { msg: 'Build complete' }, 1.0);
        resolve('success');
    } catch (error) {
        console.error(`\n${FgRed}Custom build fail!${Reset} \n`);
        eventBus?.publish<PublishType>('progress', { msg: 'Build interrupt' }, 0);
        reject('fail');
    }
}

function copyFileSync(source: string, target: string) {
    var targetFile = target;

    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

/**
 * Reference https://stackoverflow.com/a/26038979
 * @param source
 * @param target
 */
function copyFolderRecursiveSync(source: string, target: string) {
    var files = [];

    // Check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    // Copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}
