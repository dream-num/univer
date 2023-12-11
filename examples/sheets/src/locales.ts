import { LocaleType } from '@univerjs/core';
import { enUS as UniverDesignEnUS } from '@univerjs/design';
import { enUS as UniverDocsUIEnUS } from '@univerjs/docs-ui';
import { enUS as UniverSheetsEnUS } from '@univerjs/sheets';
import { enUS as UniverSheetsUIEnUS } from '@univerjs/sheets-ui';
import { enUS as UniverUiEnUS } from '@univerjs/ui';

export const locales = {
    [LocaleType.EN_US]: {
        ...UniverSheetsEnUS,
        ...UniverDocsUIEnUS,
        ...UniverSheetsUIEnUS,
        ...UniverUiEnUS,
        ...UniverDesignEnUS,
    },
};
