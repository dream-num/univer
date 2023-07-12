import { SheetContext, Observable, Plugin } from '@univerjs/core';

export type BulletPluginObserve = {
    onAfterChangeFontFamilyObservable: Observable<any>;
    onAfterChangeFontSizeObservable: Observable<any>;
};

export class BulletPlugin extends Plugin<BulletPluginObserve> {
    dealWidthCustomBulletOrderedSymbol(startIndex: number, startNumber: number, glyphType: string) {
        return '';
    }

    onMounted(ctx: SheetContext): void {}

    onDestroy(): void {}
}
