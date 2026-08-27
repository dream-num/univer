import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/sk-SK';
import docsUI from '@univerjs/docs-ui/locale/sk-SK';
import slidesUI from '@univerjs/slides-ui/locale/sk-SK';
import ui from '@univerjs/ui/locale/sk-SK';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
