import { Nullable } from '@univerjs/core';
import { ICell } from '../../Interfaces/Cell';
import { BaseCellEditExtension, BaseCellEditExtensionFactory } from './CellEditExtensionFactory';
import { CellEditExtensionRegister } from './CellEditExtensionRegister';

export class CellEditExtensionManager {
    private _cellEditExtensionFactoryList: BaseCellEditExtensionFactory[];

    /**
     * inject cell position
     * @param row
     * @param column
     * @param value
     */
    handle(cell: ICell): Nullable<ICell> {
        const cellEditExtensionFactoryList = CellEditExtensionManager?.register?.cellEditExtensionFactoryList;
        if (!cellEditExtensionFactoryList) return;
        // get the sorted list
        // get the dynamically added list
        this._cellEditExtensionFactoryList = cellEditExtensionFactoryList;
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
    private _checkExtension(cell: ICell): BaseCellEditExtension | false {
        let extension: BaseCellEditExtension | false = false;
        if (!this._cellEditExtensionFactoryList) return false;

        for (let index = 0; index < this._cellEditExtensionFactoryList.length; index++) {
            const extensionFactory = this._cellEditExtensionFactoryList[index];
            extension = extensionFactory.check(cell);
            if (extension !== false) {
                break;
            }
        }
        return extension;
    }

    static register: CellEditExtensionRegister;

    static create(): CellEditExtensionRegister {
        if (!this.register) {
            this.register = new CellEditExtensionRegister();
            this.register.initialize();
        }

        return this.register;
    }
}
