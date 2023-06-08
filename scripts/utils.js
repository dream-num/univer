// Reference https://github.com/vuejs/vue-next/blob/master/scripts/utils.js

const fs = require('fs');
const path = require('path');
const os = require('os');

const targets = (exports.targets = fs.readdirSync('packages').filter((f) => {
    try {
        if (!fs.statSync(`packages/${f}`).isDirectory()) {
            return false;
        }
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const pkg = require(`../packages/${f}/package.json`);
        if (pkg.private && !pkg.buildOptions) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}));

function osType() {
    if (os.type() === 'Windows_NT') {
        //windows
        return 'windows';
    }
    if (os.type() === 'Darwin') {
        //mac
        return 'mac';
    }
    if (os.type() === 'Linux') {
        //Linux
        return 'linux';
    }
    //Prompt not supported
    return '';
}

exports.osType = osType;

exports.copyFileSync = function copyFileSync(source, target) {
    let targetFile = target;

    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
};
