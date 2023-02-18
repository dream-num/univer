import { IDragAndDropData } from '../../Interfaces';
import { BaseDragAndDropExtensionFactory } from './DragAndDropExtensionFactory';
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
    handle(data: IDragAndDropData[]) {
        const DragAndDropExtensionFactoryList = this._register?.DragAndDropExtensionFactoryList;
        if (!DragAndDropExtensionFactoryList) return;
        // get the sorted list
        // get the dynamically added list
        this._DragAndDropExtensionFactoryList = DragAndDropExtensionFactoryList;

        this._checkExtension(data);
    }

    /**
     * Execute when the action is matched
     * @param command
     * @returns
     */
    private _checkExtension(data: IDragAndDropData[]) {
        if (!this._DragAndDropExtensionFactoryList) return false;
        this._DragAndDropExtensionFactoryList.forEach((extensionFactory) => {
            const extension = extensionFactory.check(data);
            if (extension !== false) {
                extension.execute();
            }
        });
    }

    dragResolver(evt: DragEvent) {
        return new Promise((resolve: (data: IDragAndDropData[]) => void, reject) => {
            if (!evt.dataTransfer) return;

            const dataList: IDragAndDropData[] = [];
            if (evt.dataTransfer.items) {
                // Use DataTransferItemList interface to access the file(s)

                [...evt.dataTransfer.items].forEach((item, i) => {
                    // If dropped items aren't files, reject them
                    if (item.kind === 'file') {
                        const file = item.getAsFile();

                        if (file) {
                            dataList.push({
                                kind: item.kind,
                                type: item.type,
                                file,
                            });
                        }
                    }
                });
            } else {
                // Use DataTransfer interface to access the file(s)
                [...evt.dataTransfer.files].forEach((file, i) => {
                    if (file) {
                        dataList.push({
                            kind: 'file',
                            type: file.type,
                            file,
                        });
                    }
                });
            }

            resolve(dataList);
        });
    }
}
