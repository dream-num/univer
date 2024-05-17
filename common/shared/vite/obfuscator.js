const process = require('node:process');
const JavaScriptObfuscator = require('javascript-obfuscator');

exports.obfuscator = function obfuscator() {
    return {
        name: 'obfuscator',
        enforce: 'post',
        async generateBundle(_options, bundle) {
            if (process.env.BUNDLE_TYPE === 'lite') {
                for (const file in bundle) {
                    if (bundle[file].type === 'chunk' && /\.js$/.test(file)) {
                        const code = bundle[file].code;
                        const obfuscationResult = JavaScriptObfuscator.obfuscate(code);
                        bundle[file].code = obfuscationResult.getObfuscatedCode();
                    }
                }
            }
        },
    };
};
