const fs = require('fs');
const path = require('path');
const execa = require('execa');
const rimraf = require('rimraf');
const { spawn } = require('child_process');

const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

try {
    // clear folder
    rimraf('./temp/*', () => {
        execScript('npm', ['run', 'tsc'], () => {
            // generate api
            apiExtractor().then(
                () => {
                    apiDocumenter();
                },
                () => {
                    apiDocumenter();
                }
            );
        });
    });
} catch (error) {
    console.log(error);
}

function apiExtractor() {
    const apiExtractorJsonPath = path.join(__dirname, './api-extractor.json');

    // Load and parse the api-extractor.json file
    const extractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);

    return new Promise((resolve, reject) => {
        try {
            // Invoke API Extractor
            const extractorResult = Extractor.invoke(extractorConfig, {
                // Equivalent to the "--local" command-line parameter
                localBuild: true,

                // Equivalent to the "--verbose" command-line parameter
                showVerboseMessages: true,
            });

            if (extractorResult.succeeded) {
                console.log(`API Extractor completed successfully`);
                process.exitCode = 0;

                resolve();
            } else {
                console.error(
                    `API Extractor completed with ${extractorResult.errorCount} errors` +
                        ` and ${extractorResult.warningCount} warnings`
                );
                process.exitCode = 1;

                reject();
            }
        } catch (p) {
            console.log(`Exit code: ${p.exitCode}`);
            console.log(`Error: ${p.stderr}`);

            reject();
        }
    });
}

async function apiDocumenter() {
    // create empty folders
    let input = 'temp/input';
    let markdown = 'temp/markdown';

    let apiJsonData = fs.readFileSync('api-config.json');
    let { oldInputPath, newInputPath, oldMarkdownPath, newMarkdownPath } =
        JSON.parse(apiJsonData);

    const mkmvInput = new Promise((resolve, reject) => {
        mkdir(input, () => {
            mv(oldInputPath, newInputPath, resolve);
        });
    });
    const mkmvMarkdown = new Promise((resolve, reject) => {
        mkdir(markdown, () => {
            mv(oldMarkdownPath, newMarkdownPath, resolve);
        });
    });

    Promise.all([mkmvInput, mkmvMarkdown]).then(() => {
        execScript(
            'api-documenter generate --input-folder ./temp/input --output-folder ./doc'
        );
    });
}

function mkdir(dir, cb) {
    fs.mkdir(path.join(__dirname, dir), (err) => {
        if (err) {
            return console.error(err);
        }
        console.log(`Successfully create ${dir}!`);

        cb && cb();
    });
}

function mv(oldPath, newPath, cb) {
    fs.rename(oldPath, newPath, function (err) {
        if (err) throw err;
        console.log(`Successfully move ${oldPath} to ${newPath}!`);
        cb && cb();
    });
}

function execScript(cmd, args = [], cb) {
    //kick off process of listing files
    const child = spawn(cmd, args, { shell: true });

    //spit stdout to screen
    child.stdout.on('data', function (data) {
        process.stdout.write(data.toString());
    });

    //spit stderr to screen
    child.stderr.on('data', function (data) {
        process.stdout.write(data.toString());
    });

    child.on('close', function (code) {
        console.log('Finished with code ' + code);

        cb && cb();
    });
}
