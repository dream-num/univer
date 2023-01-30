#!/usr/bin/env node

/**
 * Quickly generate plug-in directory
 *
 * Reference from https://github.com/DuwainevanDriel/project-template-generator
 */

import chalk from 'chalk';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import * as path from 'path';
import * as template from './utils/template';
interface CliOptions {
    projectName: string;
    templateName: string;
    templatePath: string;
    tartgetPath: string;
}

// interface IOptions {
//     inner?: boolean;
// }
export function create() {
    const cliOptions: CliOptions = {
        //@ts-ignore
        projectName: '',
        //@ts-ignore
        templateName: '',
        templatePath: '',
        tartgetPath: '',
    };

    const SKIP_FILES = ['node_modules', '.template.json'];

    const CURR_DIR = process.cwd();
    const inner = process.argv[3];

    let DESTINATION_DIR = '';
    let projectChoice = '';
    let projectValue = '';
    let projectUpperValue = '';
    let projectConstantValue = '';
    let projectName = '';

    if (inner === 'inner') {
        // core repository create plugin
        DESTINATION_DIR = path.join(CURR_DIR, '../packages');
    } else {
        // cli
        DESTINATION_DIR = path.join(CURR_DIR, '');
    }

    const TEMP_PLUGIN_NAME = 'Sort';

    const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));
    const QUESTIONS = [
        {
            name: 'template',
            type: 'list',
            message: 'What template would you like to use?',
            choices: CHOICES,
        },
        {
            name: 'name',
            type: 'input',
            message: 'Please input a new plugin name:',
        },
    ];

    inquirer.prompt(QUESTIONS).then((answers) => {
        projectChoice = answers['template'] as string;
        projectValue = covertToCamelCase(answers['name'] as string);
        projectUpperValue = covertToPascalCase(projectValue);
        projectConstantValue = covertToConstantCase(projectValue);
        projectName = covertToParamCase(projectValue, projectChoice);

        //@ts-ignore
        const templatePath = path.join(__dirname, 'templates', projectChoice);

        // sheets-plugin-data-validation => sheets-plugin-data-validation
        //@ts-ignore
        const tartgetPath = path.join(DESTINATION_DIR, projectName);

        cliOptions.projectName = projectName;
        cliOptions.templateName = projectChoice;
        cliOptions.templatePath = templatePath;
        cliOptions.tartgetPath = tartgetPath;

        if (!createProject(tartgetPath)) {
            return;
        }

        //@ts-ignore
        createDirectoryContents(templatePath, projectName, cliOptions);

        // postProcess(cliOptions);
        devTips(projectName);
    });

    function createDirectoryContents(templatePath: string, projectName: string) {
        // read all files/folders (1 level) from template folder
        const filesToCreate = fs.readdirSync(templatePath);
        // loop each file/folder
        filesToCreate.forEach((file) => {
            const origFilePath = path.join(templatePath, file);

            // get stats about the current file
            const stats = fs.statSync(origFilePath);

            // skip files that should not be copied
            if (SKIP_FILES.indexOf(file) > -1) return;

            if (stats.isFile()) {
                // read file content and transform it using template engine
                let contents = fs.readFileSync(origFilePath, 'utf8');

                contents = template.render(contents, { projectValue, projectUpperValue, projectName: cliOptions.projectName, projectConstantValue });

                // write file to destination folder
                let writePath = path.join(DESTINATION_DIR, projectName, file);

                // change file name
                if (writePath.indexOf(TEMP_PLUGIN_NAME) > -1) {
                    writePath = writePath.replace(TEMP_PLUGIN_NAME, projectUpperValue);
                }

                fs.writeFileSync(writePath, contents, 'utf8');
            } else if (stats.isDirectory()) {
                // create folder in destination folder

                let writeFolderPath = path.join(DESTINATION_DIR, projectName, file);

                // change folder name (Not recommended. Because the directory of each plug-in should be the same)
                // if (writeFolderPath.indexOf(TEMP_PLUGIN_NAME) > -1) {
                //   writeFolderPath = writeFolderPath.replace(TEMP_PLUGIN_NAME, projectUpperValue);
                // }

                fs.mkdirSync(writeFolderPath);

                // const destination = path.join(CURR_DIR, 'packages');
                // fs.mkdirSync(path.join(destination, projectName, file));
                // copy files/folder inside current folder recursively
                createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
            }
        });
    }
}

function createProject(projectPath: string) {
    if (fs.existsSync(projectPath)) {
        console.log(chalk.red(`Folder ${projectPath} exists. Delete or use another name.`));
        return false;
    }
    fs.mkdirSync(projectPath);

    return true;
}

function devTips(projectName: string) {
    // pnpm run --filter  @univerjs/sheets-plugin-<%= projectValue %> dev
    console.log(chalk.green(`\nSuccess!\n`));
    console.log(chalk.white(`Install Dependencies: \n`, chalk.green(`pnpm i --filter  @univerjs/${projectName}\n`)));
    console.log(chalk.white(`Develop: \n`, chalk.green(`pnpm run --filter  @univerjs/${projectName} dev\n`)));
}

function covertToPascalCase(str: string) {
    return str
        .replace(/\b\w/g, (match) => {
            return match.toUpperCase();
        })
        .replace(/-/g, '');
}

function covertToParamCase(str: string, prefix: string) {
    return prefix + str.replace(/(-\w|[A-Z]|\b\w)/g, (match) => (match.indexOf('-') > -1 ? match.toLowerCase() : `-${match.toLowerCase()}`));
}

/**
 *
 * Reference: https://stackoverflow.com/a/2970667
 * @param str
 * @returns
 */
function covertToCamelCase(str: string) {
    return str
        .replace(/(?:\b\w)/g, function (match, index) {
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        })
        .replace(/-/g, '');
}

function covertToConstantCase(str: string) {
    return str
        .replace(/(-\w|[A-Z]|\b\w)/g, (match) => (match.indexOf('-') > -1 ? match.replace('-', '_') : `_${match}`))
        .slice(1)
        .toUpperCase();
}
