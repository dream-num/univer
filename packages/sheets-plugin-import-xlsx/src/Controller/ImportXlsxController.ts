import { PLUGIN_NAMES } from '@univer/core';
import { BaseComponentRender } from '@univer/base-component';
import { IToolBarItemProps, SelectTypes, SheetPlugin } from '@univer/base-sheets';

import { IMPORT_XLSX_PLUGIN_NAME } from '../Basic/Const';
import { ImportXlsxPlugin } from '../ImportXlsxPlugin';

export class ImportXlsxController {
    protected _sheetPlugin: SheetPlugin;

    protected _toolButton: IToolBarItemProps;

    protected _plugin: ImportXlsxPlugin;

    protected _render: BaseComponentRender;

    constructor(plugin: ImportXlsxPlugin) {
        this._plugin = plugin;
        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._toolButton = {
            name: IMPORT_XLSX_PLUGIN_NAME,
            type: SelectTypes.FIX,
            locale: 'importXlsx.tooltip',
            tooltipLocale: 'importXlsx.tooltip',
            show: true,
            hideSelectedIcon: true,
            children: [
                {
                    locale: 'importXlsx.one',
                    onClick: () => {
                        console.log('one');
                    },
                },
                {
                    locale: 'importXlsx.two',
                    onClick: () => {
                        console.log('two');
                    },
                },
                {
                    locale: 'importXlsx.three',
                    onClick: () => {
                        console.log('three');
                    },
                },
            ],
        };
        this._sheetPlugin.addToolButton(this._toolButton);
    }
}
