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

export function trimClassNamePlugin() {
    return {
        name: 'vite-plugin-trim-classname',
        transform(code, id) {
            if (id.endsWith('.tsx')) {
                const transformedCode = code.replace(
                    /className: `([^`}]+)`/g,
                    (match, classNameValue) => {
                        const cleanedClassName = classNameValue
                            .replace(/\n/g, ' ')
                            .replace(/\s{2,}/g, ' ')
                            .trim();
                        return `className: \`${cleanedClassName}\``;
                    }
                ).replace(
                    /clsx\(`([^`}]+)`/g,
                    (match, classNameValue) => {
                        const cleanedClassName = classNameValue
                            .replace(/\n/g, ' ')
                            .replace(/\s{2,}/g, ' ')
                            .trim();
                        return `clsx(\`${cleanedClassName}\``;
                    }
                );

                return {
                    code: transformedCode,
                    map: null,
                };
            }
            return null;
        },
    };
};
