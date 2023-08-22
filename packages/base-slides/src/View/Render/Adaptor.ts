import { Scene } from '@univerjs/base-render';
import { IPageElement, PageElementType, Registry } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';

export class ObjectAdaptor {
    zIndex = 0;

    viewKey: PageElementType;

    check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    convert(pageElement: IPageElement, mainScene: Scene) { }
    create(injector: Injector){}
}

export const CanvasObjectProviderRegistry = Registry.create();
