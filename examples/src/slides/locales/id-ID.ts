import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/id-ID';
import docsUI from '@univerjs/docs-ui/locale/id-ID';
import slidesUI from '@univerjs/slides-ui/locale/id-ID';
import ui from '@univerjs/ui/locale/id-ID';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
