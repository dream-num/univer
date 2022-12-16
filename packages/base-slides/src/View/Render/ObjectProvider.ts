import { BaseObject } from '@univer/base-render';
import { ContextBase, IPageElement, sortRules } from '@univer/core';
import { CanvasObjectProviderRegistry, ObjectAdaptor } from './Adaptor';
import './Adaptors';

export class ObjectProvider {
    private _adaptors: ObjectAdaptor[] = [];

    constructor() {
        this._adaptorLoader();
    }

    convertToRenderObjects(pageElements: { [elementId: string]: IPageElement }, context: ContextBase) {
        const pageKeys = Object.keys(pageElements);
        const objects: BaseObject[] = [];
        pageKeys.forEach((key) => {
            const pageElement = pageElements[key];
            const o = this._executor(pageElement, context);
            if (o != null) {
                objects.push(o);
            }
        });
        return objects;
    }

    private _executor(pageElement: IPageElement, context: ContextBase) {
        const { id: pageElementId, type } = pageElement;

        for (let adaptor of this._adaptors) {
            const o = adaptor.check(type)?.convert(pageElement, context);
            if (o != null) {
                return o;
            }
        }

        return;
    }

    private _adaptorLoader() {
        CanvasObjectProviderRegistry.getData()
            .sort(sortRules)
            .forEach((adaptor: ObjectAdaptor) => {
                this._adaptors.push(adaptor);
            });
    }

    static create() {
        return new ObjectProvider();
    }
}
