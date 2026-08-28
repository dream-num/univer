import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/fa-IR';
import docsUI from '@univerjs/docs-ui/locale/fa-IR';
import slidesUI from '@univerjs/slides-ui/locale/fa-IR';
import ui from '@univerjs/ui/locale/fa-IR';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
