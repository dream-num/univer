import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/ar-SA';
import docsUI from '@univerjs/docs-ui/locale/ar-SA';
import slidesUI from '@univerjs/slides-ui/locale/ar-SA';
import ui from '@univerjs/ui/locale/ar-SA';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
