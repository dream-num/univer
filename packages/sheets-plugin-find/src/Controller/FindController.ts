import { BaseComponentRender, BaseComponentSheet } from '@univer/base-component';
import { IToolBarItemProps, SpreadsheetPlugin } from '@univer/base-sheets';
import { PLUGIN_NAMES } from '@univer/core';
import { FIND_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { FindPlugin } from '../FindPlugin';

export class FindController {
    private _plugin: FindPlugin;

    private _findList: IToolBarItemProps;

    private _render: BaseComponentRender;

    private _spreadSheetPlugin: SpreadsheetPlugin;

    constructor(plugin: FindPlugin) {
        this._plugin = plugin;
        this._spreadSheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this.initRegisterComponent();

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

        this._spreadSheetPlugin.addToolButton(this._findList);
    }

    // 注册自定义组件
    initRegisterComponent() {
        const component = this._plugin.getContext().getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        const registerIcon = {
            SearchIcon: this._render.renderFunction('SearchIcon'),
            ReplaceIcon: this._render.renderFunction('ReplaceIcon'),
            LocationIcon: this._render.renderFunction('LocationIcon'),
        };

        for (let k in registerIcon) {
            this._spreadSheetPlugin.registerComponent(k, registerIcon[k]);
        }
    }

    showModal(name: string, show: boolean) {
        this._plugin.getFindModalController().showModal(name, show);
    }
}
