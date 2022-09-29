import { Context, IOCContainer, Observable, Plugin } from '@univer/core';
import { IDocumentSkeletonPage, ISectionBreakConfig, ISkeletonResourceReference } from '..';

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

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: Context): void {}

    onDestroy(): void {}
}
