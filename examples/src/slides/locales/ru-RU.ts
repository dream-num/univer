import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/ru-RU';
import docsUI from '@univerjs/docs-ui/locale/ru-RU';
import slidesUI from '@univerjs/slides-ui/locale/ru-RU';
import ui from '@univerjs/ui/locale/ru-RU';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
