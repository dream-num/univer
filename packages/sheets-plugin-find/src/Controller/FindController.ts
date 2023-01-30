import { BaseComponentRender } from '@univerjs/base-component';
import { IToolBarItemProps, SheetPlugin } from '@univerjs/base-sheets';
import { PLUGIN_NAMES } from '@univerjs/core';
import { FIND_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { FindPlugin } from '../FindPlugin';

export class FindController {
    private _plugin: FindPlugin;

    private _findList: IToolBarItemProps;

    private _render: BaseComponentRender;

    private _sheetPlugin: SheetPlugin;

    constructor(plugin: FindPlugin) {
        this._plugin = plugin;
        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._findList = {
            name: FIND_PLUGIN_NAME,
            type: 4,
            tooltipLocale: 'find.findLabel',
            show: true,
            label: 'SearchIcon',
            children: [
                {
                    locale: 'find.find',
                    suffix: 'SearchIcon',
                    onClick: () => {
                        this.showModal('find', true);
                    },
                },
                // {
                //     locale: 'find.replace',
                //     suffix: 'ReplaceIcon',
                //     onClick: () => {
                //         // this.showFind('replace');
                //     },
                // },
                // {
                //     locale: 'find.location',
                //     suffix: 'LocationIcon',
                //     border: true,
                //     onClick: () => {
                //         // this.showLocation();
                //     },
                // },
                // {
                //     locale: 'find.formula',
                //     suffixLocale: 'find.locationExample',
                //     onClick: () => {},
                // },
                // {
                //     locale: 'find.date',
                //     suffixLocale: 'find.locationExample',
                // },
                // {
                //     locale: 'find.number',
                //     suffixLocale: 'find.locationExample',
                // },
                // {
                //     locale: 'find.string',
                //     suffixLocale: 'find.locationExample',
                // },
                // {
                //     locale: 'find.error',
                //     suffixLocale: 'find.locationExample',
                // },
                // {
                //     locale: 'find.condition',
                //     suffixLocale: 'find.locationExample',
                // },
                // {
                //     locale: 'find.rowSpan',
                //     suffixLocale: 'find.locationExample',
                // },
                // {
                //     locale: 'find.columnSpan',
                //     suffixLocale: 'find.locationExample',
                // },
            ],
            hideSelectedIcon: true,
        };

        this._sheetPlugin.addToolButton(this._findList);
    }

    showModal(name: string, show: boolean) {
        this._plugin.getFindModalController().showModal(name, show);
    }
}
