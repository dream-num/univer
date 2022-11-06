import { Nullable } from '@univer/core';
import { BaseCellExtension, BaseCellExtensionFactory, ICell } from './CellExtensionFactory';
import { CellExtensionRegister } from './CellExtensionRegister';

export class CellExtensionManager {
    private _cellExtensionFactoryList: BaseCellExtensionFactory[];

    /**
     * inject cell position
     * @param row
     * @param column
     * @param value
     */
    handle(cell: ICell): Nullable<ICell> {
        // get the sorted list
        // get the dynamically added list
        this._cellExtensionFactoryList = CellExtensionManager.register.cellExtensionFactoryList;
        const extension = this._checkExtension(cell);
        if (extension) {
            extension.execute();
            return extension.getCell();
        }
    }

    /**
     * Execute when the action is matched
     * @param command
     * @returns
     */
    private _checkExtension(cell: ICell): BaseCellExtension | false {
        let extension: BaseCellExtension | false = false;
        if (!this._cellExtensionFactoryList) return false;

        for (let index = 0; index < this._cellExtensionFactoryList.length; index++) {
            const extensionFactory = this._cellExtensionFactoryList[index];
            extension = extensionFactory.check(cell);
            if (extension !== false) {
                break;
            }
        }
        return extension;
    }

    static register: CellExtensionRegister;

    static create(): CellExtensionRegister {
        if (!this.register) {
            this.register = new CellExtensionRegister();
            this.register.initialize();
        }

        return this.register;
    }
}
