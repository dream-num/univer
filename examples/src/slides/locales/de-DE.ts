import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/de-DE';
import docsUI from '@univerjs/docs-ui/locale/de-DE';
import slidesUI from '@univerjs/slides-ui/locale/de-DE';
import ui from '@univerjs/ui/locale/de-DE';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
