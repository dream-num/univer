import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/es-ES';
import docsUI from '@univerjs/docs-ui/locale/es-ES';
import slidesUI from '@univerjs/slides-ui/locale/es-ES';
import ui from '@univerjs/ui/locale/es-ES';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
