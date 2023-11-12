// The entry of web worker scripts

import { SheetPlugin } from '@univerjs/base-sheets';
import { LocaleType, Univer } from '@univerjs/core';

// Univer web worker is also a univer application.
const univer = new Univer({
    locale: LocaleType.EN_US,
});

univer.registerPlugin(SheetPlugin);
