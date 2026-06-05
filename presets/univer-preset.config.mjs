/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const config = {
    umdDeps: [
        '@univerjs/themes',
        '@univerjs/protocol',
        '@univerjs/core',
        '@univerjs/network',
        '@univerjs/telemetry',
        '@univerjs/rpc',
        '@univerjs/engine-render',
        '@univerjs/engine-formula',
        '@univerjs/drawing',
    ],
    umdAdditionalFiles: [
        './node_modules/@univerjs-infra/shared/react-polyfill/react-polyfill.js',
        './node_modules/@wendellhu/redi/dist/umd/index.js',
        './node_modules/@wendellhu/redi/dist/umd/react-bindings/index.js',
    ],
};

export default config;
