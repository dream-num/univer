import { Scene } from '@univerjs/base-render';
import { ContextBase, IPageElement, PageElementType, Registry } from '@univerjs/core';

export class ObjectAdaptor {
    zIndex = 0;

    viewKey: PageElementType;

    check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    convert(pageElement: IPageElement, mainScene: Scene, context?: ContextBase) {}
}

export const CanvasObjectProviderRegistry = Registry.create();
