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

import { IUniverInstanceService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { of, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DOCS_IMAGE_MENU_ID, IMAGE_MENU_UPLOAD_FLOAT_ID, ImageMenuFactory, UploadFloatImageMenuFactory } from '../image.menu';

vi.mock('@univerjs/ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/ui')>();

    return {
        ...actual,
        getMenuHiddenObservable: vi.fn(() => of(false)),
    };
});

describe('docs image menu', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('disables the image menu when the current text selection is inside a table or missing', async () => {
        let activeTextRange: any = null;
        const textSelection$ = new Subject<void>();
        const menu = ImageMenuFactory({
            get: (token: unknown) => {
                if (token === DocSelectionManagerService) {
                    return {
                        textSelection$,
                        getActiveTextRange: () => activeTextRange,
                    };
                }

                if (token === IUniverInstanceService) {
                    return {
                        getCurrentUniverDocInstance: () => ({
                            getSelfOrHeaderFooterModel: () => ({
                                getBody: () => ({
                                    tables: [{
                                        startIndex: 1,
                                        endIndex: 4,
                                    }],
                                }),
                            }),
                        }),
                    };
                }

                throw new Error(`Unknown dependency ${String(token)}`);
            },
        } as never);

        const values: boolean[] = [];
        const subscription = menu.disabled$!.subscribe((value) => values.push(value));

        textSelection$.next();
        activeTextRange = { segmentId: '', startOffset: 2, endOffset: 2 };
        textSelection$.next();
        activeTextRange = { segmentId: '', startOffset: 5, endOffset: 5 };
        textSelection$.next();

        expect(menu.id).toBe(DOCS_IMAGE_MENU_ID);
        expect(values).toEqual([true, true, false]);

        subscription.unsubscribe();
    });

    it('creates the upload float image menu item with the command id', async () => {
        const menu = UploadFloatImageMenuFactory({} as never);
        const hiddenValues: boolean[] = [];
        const subscription = menu.hidden$!.subscribe((value) => hiddenValues.push(value));

        expect(menu.id).toBe(IMAGE_MENU_UPLOAD_FLOAT_ID);
        expect(menu.title).toBe('docImage.upload.float');
        expect(hiddenValues.at(-1)).toBe(false);

        subscription.unsubscribe();
    });
});
