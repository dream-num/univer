import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/ko-KR';
import docsUI from '@univerjs/docs-ui/locale/ko-KR';
import slidesUI from '@univerjs/slides-ui/locale/ko-KR';
import ui from '@univerjs/ui/locale/ko-KR';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
