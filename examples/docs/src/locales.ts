import { LocaleType } from '@univerjs/core';
import { enUS as UniverDesignEnUS } from '@univerjs/design';
import { enUS as UniverDocsUIEnUS } from '@univerjs/docs-ui';
import { enUS as UniverUIEnUS } from '@univerjs/ui';

export const locales = {
    [LocaleType.EN_US]: {
        ...UniverDocsUIEnUS,
        ...UniverUIEnUS,
        ...UniverDesignEnUS,
    },
};
