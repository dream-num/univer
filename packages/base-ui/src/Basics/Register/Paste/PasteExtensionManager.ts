import { Command, IActionData, Plugin } from '@univerjs/core';
import { IPasteData } from '../../Interfaces';
import { PasteType } from '../../Interfaces/PasteType';
import { BasePasteExtension, BasePasteExtensionFactory } from './PasteExtensionFactory';
import { PasteExtensionRegister } from './PasteExtensionRegister';
import { Clipboard } from '../../Shared/Clipboard';

export class PasteExtensionManager {
    private _pasteExtensionFactoryList: BasePasteExtensionFactory[];

    // mounted on the instance
    private _register: PasteExtensionRegister;

    constructor(private _plugin: Plugin) {
        this._register = new PasteExtensionRegister();
    }

    getRegister(): PasteExtensionRegister {
        return this._register;
    }

    /**
     * inject all actions
     * @param command
     */
    handle(data: IPasteData) {
        const clipboardExtensionFactoryList = this._register?.pasteExtensionFactoryList;
        if (!clipboardExtensionFactoryList) return;
        // get the sorted list
        // get the dynamically added list
        this._pasteExtensionFactoryList = clipboardExtensionFactoryList;
        this._checkExtension(data);
        // const extension = this._checkExtension(data);

        // Need to handle multiple extensions
        // if (extension) {
        //     extension.execute();
        // }
    }

    pasteResolver(evt?: ClipboardEvent) {
        return new Promise((resolve: (value: IPasteData) => void, reject) => {
            Clipboard.read(evt).then((file: string | Array<PasteType | null> | null) => {
                if (!file) return [];
                const data: IPasteData = {};
                if (typeof file === 'string') {
                    data.html = file;
                } else {
                    const HtmlIndex = file.findIndex((item: PasteType | null, index: number) => item && item.type === 'text/html');
                    const PlainIndex = file.findIndex((item: PasteType | null, index: number) => item && item.type === 'text/plain');

                    if (HtmlIndex > -1) {
                        const html = file[HtmlIndex]?.result as string;
                        data.html = html;
                    }
                    if (PlainIndex > -1) {
                        const plain = file[PlainIndex]?.result as string;
                        data.plain = plain;
                    }
                }

                resolve(data);
            });
        });
    }

    /**
     * Execute when the action is matched
     * @param command
     * @returns
     */
    private _checkExtension(data: IPasteData) {
        if (!this._pasteExtensionFactoryList) return false;
        let actionDataList: IActionData[] = [];
        let extension: BasePasteExtension | false = false;
        for (let index = 0; index < this._pasteExtensionFactoryList.length; index++) {
            const extensionFactory = this._pasteExtensionFactoryList[index];
            extension = extensionFactory.check(data);
            if (extension !== false) {
                const extensionActionList = extension.execute();
                actionDataList = actionDataList.concat(extensionActionList);
            }
        }
        this._invokeAction(actionDataList);
    }

    private _invokeAction(actionDataList: IActionData[]) {
        const _commandManager = this._plugin.getGlobalContext().getCommandManager();
        const workBook = this._plugin.getUniver().getCurrentUniverSheetInstance().getWorkBook();

        const command = new Command(
            {
                WorkBookUnit: workBook,
            },
            ...actionDataList
        );

        _commandManager.invoke(command);
    }
}
