import { Scene } from '@univer/base-render';
import { ContextBase, IPageElement, PageElementType, Registry } from '@univer/core';

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
