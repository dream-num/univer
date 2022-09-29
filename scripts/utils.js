// Reference https://github.com/vuejs/vue-next/blob/master/scripts/utils.js

const fs = require('fs');
const kill = require('tree-kill');
const find = require('find-process');
const os = require('os');
const child_process = require('child_process');

const targets = (exports.targets = fs.readdirSync('packages').filter((f) => {
    try {
        if (!fs.statSync(`packages/${f}`).isDirectory()) {
            return false;
        }
        const pkg = require(`../packages/${f}/package.json`);
        if (pkg.private && !pkg.buildOptions) {
            return false;
        }
        return true;
    } catch (error) {}
}));

function osType() {
    if (os.type() == 'Windows_NT') {
        //windows
        return 'windows';
    } else if (os.type() == 'Darwin') {
        //mac
        return 'mac';
    } else if (os.type() == 'Linux') {
        //Linux
        return 'linux';
    } else {
        //Prompt not supported
        return '';
    }
}

exports.osType = osType;

exports.copyFileSync = function (source, target) {
    var targetFile = target;

    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
};
