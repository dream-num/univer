import { SheetContext, Observable, Plugin } from '@univerjs/core';
import { IDocumentSkeletonPage, ISkeletonResourceReference } from '../Basics/IDocumentSkeletonCached';
import { ISectionBreakConfig } from '../Basics/Interfaces';

export type BlockPluginObserve = {
    onAfterChangeFontFamilyObservable: Observable<any>;
    onAfterChangeFontSizeObservable: Observable<any>;
};

export class BlockPlugin extends Plugin<BlockPluginObserve> {
    dealWidthCustomBlock(
        blockId: string,
        customBlock: unknown,
        curPage: IDocumentSkeletonPage,
        sectionBreakConfig: ISectionBreakConfig,
        skeletonResourceReference: ISkeletonResourceReference
    ) {
        return [];
    }

    override onMounted(ctx: SheetContext): void {}

    override onDestroy(): void {}
}
