import { sortRules } from '@univer/core';
import { BaseDragAndDropExtensionFactory } from './DragAndDropExtensionFactory';

export class DragAndDropExtensionRegister {
    private _DragAndDropExtensionFactoryList: BaseDragAndDropExtensionFactory[] = [];

    get DragAndDropExtensionFactoryList(): BaseDragAndDropExtensionFactory[] {
        return this._DragAndDropExtensionFactoryList;
    }

    add(...extensionFactoryList: BaseDragAndDropExtensionFactory[]) {
        this._DragAndDropExtensionFactoryList.push(...extensionFactoryList);
        this._DragAndDropExtensionFactoryList.sort(sortRules);
    }

    delete(extensionFactory: BaseDragAndDropExtensionFactory) {
        const index = this._DragAndDropExtensionFactoryList.indexOf(extensionFactory);
        this._DragAndDropExtensionFactoryList.splice(index, 1);
    }
}
