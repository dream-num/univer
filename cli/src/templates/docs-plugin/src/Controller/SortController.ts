import { BaseComponentRender } from '@univerjs/base-ui';
import { DocPlugin } from '@univerjs/base-docs';
import { <%= projectConstantValue %>_PLUGIN_NAME } from '../Basics/Const';
import { <%= projectUpperValue %>Plugin } from '../<%= projectUpperValue %>Plugin';

export class <%= projectUpperValue %>Controller {
    protected _docPlugin: DocPlugin;

    protected _plugin: <%= projectUpperValue %>Plugin;

    protected _render: BaseComponentRender;

    constructor(plugin: <%= projectUpperValue %>Plugin) {
        this._plugin = plugin;
    }
}
