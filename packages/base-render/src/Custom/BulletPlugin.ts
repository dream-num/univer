import { Context, IOCContainer, Observable, Plugin } from '@univer/core';

export type BulletPluginObserve = {
    onAfterChangeFontFamilyObservable: Observable<any>;
    onAfterChangeFontSizeObservable: Observable<any>;
};

export class BulletPlugin extends Plugin<BulletPluginObserve> {
    dealWidthCustomBulletOrderedSymbol(startIndex: number, startNumber: number, glyphType: string) {
        return '';
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: Context): void {}

    onDestroy(): void {}
}
