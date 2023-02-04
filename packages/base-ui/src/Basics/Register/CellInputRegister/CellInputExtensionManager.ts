import { Nullable } from '@univerjs/core';
import { ICell } from '../../Interfaces/Cell';
import { BaseCellInputExtension, BaseCellInputExtensionFactory } from './CellInputExtensionFactory';
import { CellInputExtensionRegister } from './CellInputExtensionRegister';

export class CellInputExtensionManager {
    private _cellInputExtensionFactoryList: BaseCellInputExtensionFactory[];

    /**
     * inject cell position
     * @param row
     * @param column
     * @param value
     */
    handle(cell: ICell): Nullable<ICell> {
        const cellInputExtensionFactoryList = CellInputExtensionManager?.register?.cellInputExtensionFactoryList;
        if (!cellInputExtensionFactoryList) return;

        // get the sorted list
        // get the dynamically added list
        this._cellInputExtensionFactoryList = cellInputExtensionFactoryList;
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
    private _checkExtension(cell: ICell): BaseCellInputExtension | false {
        let extension: BaseCellInputExtension | false = false;
        if (!this._cellInputExtensionFactoryList) return false;

        for (let index = 0; index < this._cellInputExtensionFactoryList.length; index++) {
            const extensionFactory = this._cellInputExtensionFactoryList[index];
            extension = extensionFactory.check(cell);
            if (extension !== false) {
                break;
            }
        }
        return extension;
    }

    static register: CellInputExtensionRegister;

    static create(): CellInputExtensionRegister {
        if (!this.register) {
            this.register = new CellInputExtensionRegister();
            this.register.initialize();
        }

        return this.register;
    }
}
