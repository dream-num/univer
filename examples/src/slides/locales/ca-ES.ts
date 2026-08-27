import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/ca-ES';
import docsUI from '@univerjs/docs-ui/locale/ca-ES';
import slidesUI from '@univerjs/slides-ui/locale/ca-ES';
import ui from '@univerjs/ui/locale/ca-ES';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
