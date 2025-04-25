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

export const peerDepsMap = {
    react: {
        global: 'React',
        name: 'react',
        version: '^16.9.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc',
    },
    'react/jsx-runtime': {
        global: 'React',
        name: 'react',
        version: 'react',
    },
    'react-dom': {
        global: 'ReactDOM',
        name: 'react-dom',
        version: '^16.9.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc',
    },
    'react-dom/client': {
        global: 'ReactDOM',
        name: 'react-dom',
        version: 'react-dom',
    },
    rxjs: {
        global: 'rxjs',
        name: 'rxjs',
        version: '>=7.0.0',
    },
    'rxjs/operators': {
        global: 'rxjs.operators',
        name: 'rxjs',
        version: 'rxjs',
    },
    '@wendellhu/redi': {
        global: '@wendellhu/redi',
        name: '@wendellhu/redi',
        version: '0.18.0',
    },
    '@wendellhu/redi/react-bindings': {
        global: '@wendellhu/redi/react-bindings',
        name: '@wendellhu/redi',
        version: '@wendellhu/redi',
    },
    'monaco-editor': {
        global: 'monaco',
        name: 'monaco-editor',
        version: '>=0.50.0',
    },
    vue: {
        global: 'Vue',
        name: 'vue',
        version: '>=3.0.0',
        optional: true,
    },
};
