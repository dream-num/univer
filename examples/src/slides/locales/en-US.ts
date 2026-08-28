import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/en-US';
import docsUI from '@univerjs/docs-ui/locale/en-US';
import slidesUI from '@univerjs/slides-ui/locale/en-US';
import ui from '@univerjs/ui/locale/en-US';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
