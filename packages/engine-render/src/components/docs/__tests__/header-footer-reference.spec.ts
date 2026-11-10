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

import { DocumentDataModel } from '@univerjs/core';
import { expect, it } from 'vitest';
import { getDocumentHeaderFooterReferenceResolver, registerDocumentHeaderFooterReferenceResolver } from '../header-footer-reference';

it('owns reference resolvers per model and keeps a newer registration when the previous owner disposes', () => {
    const first = new DocumentDataModel({ id: 'first', body: { dataStream: '\r\n' }, documentStyle: {} });
    const second = new DocumentDataModel({ id: 'second', body: { dataStream: '\r\n' }, documentStyle: {} });
    const older = registerDocumentHeaderFooterReferenceResolver(first, () => ({ dataStream: 'older' }));
    const resolver = () => ({ dataStream: 'newer' });
    const newer = registerDocumentHeaderFooterReferenceResolver(first, resolver);
    older.dispose();
    expect(getDocumentHeaderFooterReferenceResolver(first)).toBe(resolver);
    expect(getDocumentHeaderFooterReferenceResolver(second)).toBeUndefined();
    newer.dispose();
    expect(getDocumentHeaderFooterReferenceResolver(first)).toBeUndefined();
    first.dispose();
    second.dispose();
});
