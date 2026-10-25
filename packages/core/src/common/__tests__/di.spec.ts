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

// @vitest-environment node

import type { CompilerOptions } from 'typescript';
import { createIdentifier as createRediIdentifier, Injector } from '@wendellhu/redi';
import { fileURLToPath, URL } from 'node:url';
import { createCompilerHost, createProgram, createSourceFile, ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';
import { describe, expect, it } from 'vitest';
import { createIdentifier } from '../di';

describe('dependency identifiers', () => {
    it('preserves the Redi factory and injector interoperability', () => {
        expect(createIdentifier).toBe(createRediIdentifier);

        const token = createIdentifier<{ value: string }>('core.di.test');
        const service = { value: 'registered' };
        const injector = new Injector([[token, { useValue: service }]]);
        try {
            expect(injector.get(token)).toBe(service);
        } finally {
            injector.dispose();
        }
    });

    it('emits inferred service tokens through the public Core type', () => {
        const fileName = fileURLToPath(new URL('./identifier-consumer.ts', import.meta.url)).replaceAll('\\', '/');
        const source = `
import { createIdentifier } from '@univerjs/core';
export interface IExternalService { value: string; }
export const IExternalService = createIdentifier<IExternalService>('external.service');
`;
        const options: CompilerOptions = {
            target: ScriptTarget.ESNext,
            module: ModuleKind.ESNext,
            moduleResolution: ModuleResolutionKind.Bundler,
            declaration: true,
            emitDeclarationOnly: true,
            strict: true,
            experimentalDecorators: true,
            types: [],
        };
        const host = createCompilerHost(options);
        const getSourceFile = host.getSourceFile;
        host.getSourceFile = (name, languageVersion, onError, shouldCreateNewSourceFile) => name === fileName
            ? createSourceFile(name, source, languageVersion, true)
            : getSourceFile(name, languageVersion, onError, shouldCreateNewSourceFile);
        let declaration = '';
        host.writeFile = (_name, contents) => {
            declaration = contents;
        };
        const program = createProgram([fileName], options, host);
        const consumer = program.getSourceFile(fileName);
        if (!consumer) {
            throw new Error('The declaration consumer was not loaded');
        }

        expect(program.getSemanticDiagnostics(consumer)).toEqual([]);
        expect(program.emit(consumer).diagnostics).toEqual([]);
        expect(declaration).toContain('import("@univerjs/core").IdentifierDecorator<IExternalService>');
        expect(declaration).not.toContain('@wendellhu/redi');
    });
});
