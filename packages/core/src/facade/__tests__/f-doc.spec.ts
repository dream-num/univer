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

import type { DocumentDataModel, IDocumentData, Injector } from '@univerjs/core';
import { Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FDoc } from '../f-doc';

function createDocData(id: string): Partial<IDocumentData> {
    return {
        id,
        body: {
            dataStream: 'Document facade\r\n',
        },
        documentStyle: {
            pageSize: { width: 100, height: 100 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
    };
}

describe('FDoc', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should initialize document facade extensions with the active document model', () => {
        class DocumentFacadeExtension {
            _initialize(this: { initializedByInjector?: boolean }, injector: Injector) {
                this.initializedByInjector = injector === univer.__getInjector();
            }

            getDocId(this: { doc: DocumentDataModel }) {
                return this.doc.getUnitId();
            }

            getDataStream(this: { doc: DocumentDataModel }) {
                return this.doc.getSnapshot().body?.dataStream;
            }
        }

        FDoc.extend(DocumentFacadeExtension);

        const doc = univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData('doc-facade-test')) as DocumentDataModel;
        const facadeDoc = univer.__getInjector().createInstance(FDoc, doc) as FDoc & {
            getDocId(): string;
            getDataStream(): string | undefined;
            initializedByInjector?: boolean;
        };

        expect(facadeDoc.getDocId()).toBe('doc-facade-test');
        expect(facadeDoc.getDataStream()).toBe('Document facade\r\n');
        expect(facadeDoc.initializedByInjector).toBe(true);
    });
});
