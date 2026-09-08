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

import type { IDocumentData } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import { HorizontalAlign, LocaleService, RichTextBuilder } from '@univerjs/core';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect } from 'react';

type LocaleDirection = ReturnType<LocaleService['getDirection']>;

export function alignRangeSelectorDocument(documentData: IDocumentData, direction: LocaleDirection): IDocumentData {
    return RichTextBuilder.create(documentData)
        .align({ horizontal: direction === 'rtl' ? HorizontalAlign.RIGHT : HorizontalAlign.LEFT })
        .getData();
}

export function useRangeSelectorEditorDocument(editor: Editor | null) {
    const localeService = useDependency(LocaleService);
    const direction = useObservable(localeService.direction$, localeService.getDirection());

    useEffect(() => {
        if (!editor) {
            return;
        }

        editor.setDocumentData(
            alignRangeSelectorDocument(editor.getDocumentData(), direction),
            editor.getSelectionRanges()
        );
    }, [direction, editor]);
}
