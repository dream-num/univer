import type { EmbedHostEntry } from '@univerjs/embed';
import type { UniverInstanceType } from '@univerjs/core';
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
