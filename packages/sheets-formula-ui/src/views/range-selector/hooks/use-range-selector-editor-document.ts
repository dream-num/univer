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

import type { IDocumentData, Nullable } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import { HorizontalAlign, LocaleService, RichTextBuilder, Tools } from '@univerjs/core';
import { useDependency, useEvent, useObservable } from '@univerjs/ui';
import { useEffect, useMemo } from 'react';

function getHorizontalAlign(direction: ReturnType<LocaleService['getDirection']>): HorizontalAlign {
    return direction === 'rtl' ? HorizontalAlign.RIGHT : HorizontalAlign.LEFT;
}

function createAlignedDocument(
    initialValue: IDocumentData | string | undefined,
    direction: ReturnType<LocaleService['getDirection']>
): IDocumentData {
    const documentData = typeof initialValue === 'string'
        ? RichTextBuilder.create().insertText(initialValue).getData()
        : Tools.deepClone(initialValue ?? RichTextBuilder.newEmptyData());

    return RichTextBuilder.create(documentData)
        .align({ horizontal: getHorizontalAlign(direction) })
        .getData();
}

function isAligned(documentData: IDocumentData, direction: ReturnType<LocaleService['getDirection']>): boolean {
    const horizontalAlign = getHorizontalAlign(direction);
    return documentData.documentStyle?.renderConfig?.horizontalAlign === horizontalAlign &&
        (documentData.body?.paragraphs ?? []).every(
            (paragraph) => paragraph.paragraphStyle?.horizontalAlign === horizontalAlign
        );
}

export function useRangeSelectorEditorDocument(
    editor: Nullable<Editor>,
    initialValue: IDocumentData | string | undefined
) {
    const localeService = useDependency(LocaleService);
    const direction = useObservable(localeService.direction$, localeService.getDirection());
    const initialDocument = useMemo(
        () => createAlignedDocument(initialValue, direction),
        [direction, initialValue]
    );

    useEffect(() => {
        if (!editor) {
            return;
        }

        const documentData = editor.getDocumentData();
        if (!isAligned(documentData, direction)) {
            editor.setDocumentData(createAlignedDocument(documentData, direction), editor.getSelectionRanges());
        }
    }, [direction, editor]);

    const replaceText = useEvent((text: string) => {
        if (!editor) {
            return;
        }

        const replacementBody = RichTextBuilder.create().insertText(text).getData().body;
        const documentData = {
            ...editor.getDocumentData(),
            body: replacementBody,
        };
        editor.setDocumentData(createAlignedDocument(documentData, direction), null);
    });

    return { initialDocument, replaceText };
}
