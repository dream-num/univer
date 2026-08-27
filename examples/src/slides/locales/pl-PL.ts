import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/pl-PL';
import docsUI from '@univerjs/docs-ui/locale/pl-PL';
import slidesUI from '@univerjs/slides-ui/locale/pl-PL';
import ui from '@univerjs/ui/locale/pl-PL';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
