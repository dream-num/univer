import type { IPageElement, PageElementType } from '@univerjs/core';
import { Registry } from '@univerjs/core';
import type { Scene } from '@univerjs/engine-render';
import type { Injector } from '@wendellhu/redi';

export class ObjectAdaptor {
    zIndex = 0;

    viewKey: PageElementType | null = null;

    check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    convert(pageElement: IPageElement, mainScene: Scene) {}

    create(injector: Injector) {}
}

export const CanvasObjectProviderRegistry = Registry.create();
