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

import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import noExternalImportsInFacade from './no-external-imports-in-facade';

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
});

describe('no-external-imports-in-facade', () => {
    it('explains the facade package-entry migration path', () => {
        ruleTester.run('no-external-imports-in-facade', noExternalImportsInFacade, {
            valid: [
                {
                    code: 'import { PublicCommand } from "@univerjs/example";',
                    filename: '/repo/packages/example/src/facade/f-univer.ts',
                },
                {
                    code: 'import { FThing } from "./f-thing";',
                    filename: '/repo/packages/example/src/facade/f-univer.ts',
                },
            ],
            invalid: [
                {
                    code: 'import { PrivateCommand } from "../commands/private.command";',
                    filename: '/repo/packages/example/src/facade/f-univer.ts',
                    errors: [
                        {
                            message: 'Facade files are published as a separate package entry. Do not import package-internal runtime modules through "../commands/private.command"; it can duplicate module singletons when consumers import both the package root and the facade entry. Move the needed symbol to the package root export if necessary, then import it through the package name. Type-only imports should also use a public package entry.',
                        },
                    ],
                },
            ],
        });
    });
});
