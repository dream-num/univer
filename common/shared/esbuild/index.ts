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

import fs from 'fs-extra';

export function ignoreGlobalCssPlugin() {
    return {
        name: 'ignore-global-css',
        setup(build) {
            build.onResolve({ filter: /\/global\.css$/ }, (args) => {
                if (args.importer.includes('packages')) {
                    return {
                        path: args.path,
                        namespace: 'ignore-global-css',
                        pluginData: {
                            importer: args.importer,
                        },
                    };
                }
            });

            build.onLoad({ filter: /\/global\.css$/, namespace: 'ignore-global-css' }, () => {
                return { contents: '' };
            });
        },
    };
}

export function removeClassnameNewlinesPlugin() {
    return {
        name: 'remove-classname-newlines',
        setup(build) {
            build.onLoad({ filter: /\.(tsx)$/ }, (args) => {
                const source = fs.readFileSync(args.path, 'utf8');

                const transformedSource = source.replace(
                    /className\s*=\s*{([^}]*?)}/gs,
                    (match, classNameValue) => {
                        const cleanedValue = classNameValue.replace(/`([^`]*?)`/gs, (templateMatch, templateContent) => {
                            return `\`${templateContent.replace(/\s*\n\s*/g, ' ').trim()}\``;
                        });

                        return `className={${cleanedValue.trim()}}`;
                    }
                );

                return {
                    contents: transformedSource,
                    loader: 'tsx',
                };
            });
        },
    };
}
