import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/pt-BR';
import docsUI from '@univerjs/docs-ui/locale/pt-BR';
import slidesUI from '@univerjs/slides-ui/locale/pt-BR';
import ui from '@univerjs/ui/locale/pt-BR';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
