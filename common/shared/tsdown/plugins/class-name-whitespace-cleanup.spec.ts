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

import { describe, expect, it } from 'vitest';
import { cleanupClassNameTemplateWhitespace } from './class-name-whitespace-cleanup';

describe('cleanupClassNameTemplateWhitespace', () => {
    it('should normalize whitespace for clsx template arguments', () => {
        const sourceCode = `
            const value = clsx(\`
              univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center
              univer-justify-self-center univer-rounded
              hover:univer-bg-gray-100
              dark:hover:!univer-bg-gray-700
            \`, {
                active: true,
            });
        `;

        expect(cleanupClassNameTemplateWhitespace(sourceCode, '/tmp/example.tsx')).toContain(
            'clsx("univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center univer-justify-self-center univer-rounded hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700", {'
        );
    });

    it('should normalize whitespace for className template literals', () => {
        const sourceCode = `
            const value = (
                <div
                    className={\`
                      univer-box-border univer-grid univer-grid-cols-5 univer-gap-2 univer-text-gray-600
                      dark:!univer-text-gray-200
                    \`}
                />
            );
        `;

        expect(cleanupClassNameTemplateWhitespace(sourceCode, '/tmp/example.tsx')).toContain(
            'className={"univer-box-border univer-grid univer-grid-cols-5 univer-gap-2 univer-text-gray-600 dark:!univer-text-gray-200"}'
        );
    });

    it('should not touch unrelated template literals', () => {
        const sourceCode = 'const message = ` hello\\n  world `;';

        expect(cleanupClassNameTemplateWhitespace(sourceCode, '/tmp/example.ts')).toBe(sourceCode);
    });
});
