import type { Plugin, PluginCtor } from '@univerjs/core';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';

export default function getLazyPlugins(): Array<[PluginCtor<Plugin>] | [PluginCtor<Plugin>, unknown]> {
    return [
        [UniverSheetsFilterUIPlugin],
    ];
}
