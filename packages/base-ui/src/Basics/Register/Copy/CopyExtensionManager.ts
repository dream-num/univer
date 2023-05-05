import { IKeyValue, Plugin } from '@univerjs/core';
import { ICopyData } from '../../Interfaces';
import { BaseCopyExtension, BaseCopyExtensionFactory } from './CopyExtensionFactory';
import { CopyExtensionRegister } from './CopyExtensionRegister';
import { Clipboard } from '../../Shared/Clipboard';

export class CopyExtensionManager {
    private _copyExtensionFactoryList: BaseCopyExtensionFactory[];

    // mounted on the instance
    private _register: CopyExtensionRegister;

    constructor(private _plugin: Plugin) {
        this._register = new CopyExtensionRegister();
    }

    getRegister(): CopyExtensionRegister {
        return this._register;
    }

    /**
     * inject all actions
     * @param command
     */
    handle(data: ICopyData) {
        const clipboardExtensionFactoryList = this._register?.copyExtensionFactoryList;
        if (!clipboardExtensionFactoryList) return;
        // get the sorted list
        // get the dynamically added list
        this._copyExtensionFactoryList = clipboardExtensionFactoryList;
        this._checkExtension(data);
        // const extension = this._checkExtension(data);

        // Need to handle multiple extensions
        // if (extension) {
        //     extension.execute();
        // }
    }

    private _copyResolver(table: string) {
        return new Promise((resolve: (table: string) => void, reject) => {
            Clipboard.write({
                data: table,
            })
                .then(() => {
                    resolve(table);
                })
                .catch(reject);
        });
    }

    /**
     * Execute when the action is matched
     * @param command
     * @returns
     */
    private _checkExtension(data: ICopyData) {
        if (!this._copyExtensionFactoryList) return false;
        let extension: BaseCopyExtension | false = false;
        let table = '';
        let property: IKeyValue = {};
        for (let index = 0; index < this._copyExtensionFactoryList.length; index++) {
            const extensionFactory = this._copyExtensionFactoryList[index];
            extension = extensionFactory.check(data);
            if (extension !== false) {
                extension.execute();
                const data = extension.getData();

                if (data.key === 'type') {
                    table = data.value;
                    if (data.tag !== 'univer') {
                        break;
                    }
                } else if (data.key === 'property') {
                    property[data.tag] = data.value;
                }
            }
        }

        this._handleTableData(table, property);
    }

    private _handleTableData(table: string, property: IKeyValue) {
        let propertyStr = ' '; // 所有的属性及值

        for (let key in property) {
            propertyStr += `data-${key}="${property[key]}" `; // 将每个键值对拼接成字符串
        }

        let insertIndex = table.indexOf('<table') + '<table'.length; // 插入位置
        let result = table.slice(0, insertIndex) + propertyStr + table.slice(insertIndex); // 插入新字符串

        console.info('handleTableData==》》===', result);

        this._copyResolver(result);
    }
}
