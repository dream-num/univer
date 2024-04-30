const process = require('node:process');
const JavaScriptObfuscator = require('javascript-obfuscator');

exports.obfuscator = function obfuscator() {
    return {
        name: 'obfuscator',
        enforce: 'post',
        async generateBundle(options, bundle) {
            if (process.env.BUNDLE_TYPE === 'lite') {
                for (const file in bundle) {
                    if (bundle[file].type === 'chunk' && /\.js$/.test(file)) {
                        const code = bundle[file].code;
                        const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
                            compact: true,
                            controlFlowFlattening: true,
                            deadCodeInjection: true,
                            disableConsoleOutput: true,
                            identifierNamesGenerator: 'hexadecimal',
                            log: false,
                            numbersToExpressions: true,
                            renameGlobals: false,
                            selfDefending: true,
                            simplify: true,
                            splitStrings: true,
                            stringArray: true,
                            stringArrayEncoding: ['base64'],
                            stringArrayThreshold: 0.75,
                            transformObjectKeys: true,
                            unicodeEscapeSequence: false,
                        });
                        bundle[file].code = obfuscationResult.getObfuscatedCode();
                    }
                }
            }
        },
    };
};
