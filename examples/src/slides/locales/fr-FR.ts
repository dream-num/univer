import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/fr-FR';
import docsUI from '@univerjs/docs-ui/locale/fr-FR';
import slidesUI from '@univerjs/slides-ui/locale/fr-FR';
import ui from '@univerjs/ui/locale/fr-FR';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
