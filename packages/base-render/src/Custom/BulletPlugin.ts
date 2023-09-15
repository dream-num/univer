import { Observable, Plugin, SheetContext } from '@univerjs/core';

export type BulletPluginObserve = {
    onAfterChangeFontFamilyObservable: Observable<any>;
    onAfterChangeFontSizeObservable: Observable<any>;
};

export class BulletPlugin extends Plugin<BulletPluginObserve> {
    dealWidthCustomBulletOrderedSymbol(startIndex: number, startNumber: number, glyphType: string) {
        return '';
    }

    override onMounted(ctx: SheetContext): void {}

    override onDestroy(): void {}
}
