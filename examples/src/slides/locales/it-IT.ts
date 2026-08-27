import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/it-IT';
import docsUI from '@univerjs/docs-ui/locale/it-IT';
import slidesUI from '@univerjs/slides-ui/locale/it-IT';
import ui from '@univerjs/ui/locale/it-IT';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
