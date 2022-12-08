import { IDragAndDropData } from '../../Interfaces';
import { BaseDragAndDropExtension, BaseDragAndDropExtensionFactory } from './DragAndDropExtensionFactory';
import { DragAndDropExtensionRegister } from './DragAndDropExtensionRegister';

export class DragAndDropExtensionManager {
    private _DragAndDropExtensionFactoryList: BaseDragAndDropExtensionFactory[];

    // mounted on the instance
    private _register: DragAndDropExtensionRegister;

    getRegister(): DragAndDropExtensionRegister {
        return this._register;
    }

    constructor() {
        this._register = new DragAndDropExtensionRegister();
    }

    /**
     * inject all actions
     * @param command
     */
    handle(data: IDragAndDropData) {
        const DragAndDropExtensionFactoryList = this._register?.DragAndDropExtensionFactoryList;
        if (!DragAndDropExtensionFactoryList) return;
        // get the sorted list
        // get the dynamically added list
        this._DragAndDropExtensionFactoryList = DragAndDropExtensionFactoryList;

        const extension = this._checkExtension(data);
        if (extension) {
            extension.execute();
        }
    }

    /**
     * Execute when the action is matched
     * @param command
     * @returns
     */
    private _checkExtension(data: IDragAndDropData) {
        if (!this._DragAndDropExtensionFactoryList) return false;

        let extension: BaseDragAndDropExtension | false = false;
        for (let index = 0; index < this._DragAndDropExtensionFactoryList.length; index++) {
            const extensionFactory = this._DragAndDropExtensionFactoryList[index];
            extension = extensionFactory.check(data);
            if (extension !== false) {
                break;
            }
        }
        return extension;
    }
}
