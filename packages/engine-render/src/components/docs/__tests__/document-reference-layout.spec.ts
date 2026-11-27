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

import { DocumentDataModel, DocumentFlavor, Injector } from '@univerjs/core';
import { expect, it, onTestFinished } from 'vitest';
import { getDocumentReferenceLayoutResolver, hasDocumentReferenceLayout, registerDocumentReferenceLayoutResolver } from '../../../index';

it('keeps a reused body resolver registered when its previous registration is disposed', () => {
    const injector = new Injector();
    const model = injector.createInstance(DocumentDataModel, {
        id: 'references',
        body: { dataStream: '\r\n' },
        documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
    });
    onTestFinished(() => {
        model.dispose();
        injector.dispose();
    });
    const resolver = { hasReferences: () => true, project: () => undefined };
    const first = registerDocumentReferenceLayoutResolver(model, resolver);
    const second = registerDocumentReferenceLayoutResolver(model, resolver);

    first.dispose();
    expect(getDocumentReferenceLayoutResolver(model)).toBe(resolver);
    expect(hasDocumentReferenceLayout(model)).toBe(true);
    second.dispose();
    expect(getDocumentReferenceLayoutResolver(model)).toBeUndefined();
    expect(hasDocumentReferenceLayout(model)).toBe(false);
});
