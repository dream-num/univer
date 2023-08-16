import { BaseObject, Scene } from '@univerjs/base-render';
import { IPageElement, sortRules } from '@univerjs/core';
import { CanvasObjectProviderRegistry, ObjectAdaptor } from './Adaptor';
// import './Adaptors';

export class ObjectProvider {
    private _adaptors: ObjectAdaptor[] = [];

    constructor() {
        this._adaptorLoader();
    }

    static create() {
        return new ObjectProvider();
    }

    convertToRenderObjects(pageElements: { [elementId: string]: IPageElement }, mainScene: Scene) {
        const pageKeys = Object.keys(pageElements);
        const objects: BaseObject[] = [];
        pageKeys.forEach((key) => {
            const pageElement = pageElements[key];
            const o = this._executor(pageElement, mainScene);
            if (o != null) {
                objects.push(o);
            }
        });
        return objects;
    }

    private _executor(pageElement: IPageElement, mainScene: Scene) {
        const { id: pageElementId, type } = pageElement;

        for (const adaptor of this._adaptors) {
            const o = adaptor.check(type)?.convert(pageElement, mainScene);
            if (o != null) {
                return o;
            }
        }
    }

    private _adaptorLoader() {
        CanvasObjectProviderRegistry.getData()
            .sort(sortRules)
            .forEach((adaptor: ObjectAdaptor) => {
                this._adaptors.push(adaptor);
            });
    }
}
