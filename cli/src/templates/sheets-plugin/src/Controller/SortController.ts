import { PLUGIN_NAMES } from '@univerjs/core';
import { BaseComponentRender } from '@univerjs/base-ui';
import { IToolbarItemProps, SelectTypes, SheetPlugin } from '@univerjs/base-sheets';

import { <%= projectConstantValue %>_PLUGIN_NAME } from '../Basics/Const';
import { <%= projectUpperValue %>Plugin } from '../<%= projectUpperValue %>Plugin';

export class <%= projectUpperValue %>Controller {
    protected _sheetPlugin: SheetPlugin;

    protected _toolButton: IToolbarItemProps;

    protected _plugin: <%= projectUpperValue %>Plugin;

    protected _render: BaseComponentRender;

    constructor(plugin: <%= projectUpperValue %>Plugin) {
        this._plugin = plugin;
        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._toolButton = {
            name: <%= projectConstantValue %>_PLUGIN_NAME,
            type: SelectTypes.FIX,
            locale: '<%= projectValue %>.tooltip',
            tooltipLocale: '<%= projectValue %>.tooltip',
            show: true,
            hideSelectedIcon: true,
            children: [
                {
                    locale: '<%= projectValue %>.one',
                    onClick: () => {
                        console.log('one');
                    },
                },
                {
                    locale: '<%= projectValue %>.two',
                    onClick: () => {
                        console.log('two');
                    },
                },
                {
                    locale: '<%= projectValue %>.three',
                    onClick: () => {
                        console.log('three');
                    },
                },
            ],
        };
        this._sheetPlugin.addToolButton(this._toolButton);
    }
}
