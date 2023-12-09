import { LocaleType } from '@univerjs/core';
import { enUS as DesignEnUS } from '@univerjs/design';
import { enUS as DocsUIPluginEnUS } from '@univerjs/docs-ui';
import { enUS as sheetsPluginEnUS } from '@univerjs/sheets';
import { enUS as SheetsUIPluginEnUS } from '@univerjs/sheets-ui';
import { enUS as BaseUiEnUS } from '@univerjs/ui';

export const locales = {
    [LocaleType.EN_US]: {
        ...sheetsPluginEnUS,
        ...DocsUIPluginEnUS,
        ...SheetsUIPluginEnUS,
        ...BaseUiEnUS,
        ...DesignEnUS,
    },
};
