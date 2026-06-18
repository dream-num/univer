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

import type { UniverInstanceType } from '@univerjs/core';
import type { EmbedHostEntry } from '@univerjs/embed';
import { UniverInstanceType as UniverType } from '@univerjs/core';

export interface EmbedHostChromePolicyInput {
    entry?: EmbedHostEntry | string;
    childType?: UniverInstanceType;
    hasMountedEmbedSlot?: boolean;
    hasMountedSlideWorkbench?: boolean;
    hasMountedSlidesFloatingObject?: boolean;
    hasMountedBaseWorkbench?: boolean;
}

export interface EmbedHostChromePolicy {
    hideHostHeaderChrome: boolean;
    hideHostFormulaBar: boolean;
    hideSheetFooterControls: boolean;
    hideSlideInsertToolbar: boolean;
    hideGlobalBaseWorkbench: boolean;
    restoreEmbedBaseWorkbench: boolean;
}

export function getEmbedHostChromePolicy(input: EmbedHostChromePolicyInput): EmbedHostChromePolicy {
    const hasActiveEntry = Boolean(input.entry);
    const childType = input.childType;
    const activeBaseChild = childType === UniverType.UNIVER_BASE;
    const activeSlideChild = childType === UniverType.UNIVER_SLIDE;

    return {
        hideHostHeaderChrome: hasActiveEntry,
        hideHostFormulaBar: input.entry === 'sheets-sheet-tab',
        hideSheetFooterControls: input.entry === 'sheets-sheet-tab' && childType === UniverType.UNIVER_SHEET,
        hideSlideInsertToolbar: Boolean(
            hasActiveEntry ||
            activeSlideChild ||
            input.entry === 'slides-page-list-block' ||
            input.hasMountedSlideWorkbench ||
            input.hasMountedSlidesFloatingObject
        ),
        hideGlobalBaseWorkbench: Boolean(
            (hasActiveEntry && input.entry !== 'bases-table-list-block') ||
            input.hasMountedBaseWorkbench ||
            (activeBaseChild && input.entry !== 'bases-table-list-block')
        ),
        restoreEmbedBaseWorkbench: Boolean(activeBaseChild || input.hasMountedBaseWorkbench),
    };
}
