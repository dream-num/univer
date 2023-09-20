import { copyFileSync } from './utils.mjs';

// The names of modules such as Selection and Range conflict with lib.dom.d.ts. api-extractor will parse to get Selection_2 and Range_2. This problem has not been fixed in api-extractor in version 7.25.0. Refer to https://github.com/microsoft/rushstack/pull/2608 for local patching to fix this issue. In addition, pnpm is not compatible with patch-package, so use node script to solve
copyFileSync(
    './patches/ApiModelGenerator.js',
    './node_modules/@microsoft/api-extractor/lib/generators/ApiModelGenerator.js'
);
