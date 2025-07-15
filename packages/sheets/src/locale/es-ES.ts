/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type enUS from './en-US';

const locale: typeof enUS = {
    sheets: {
        tabs: {
            sheetCopy: '(Copia{0})',
            sheet: 'Hoja',
        },
        info: {
            overlappingSelections: 'No se puede usar ese comando en selecciones superpuestas',
            acrossMergedCell: 'A través de una celda combinada',
            partOfCell: 'Solo una parte de una celda combinada está seleccionada',
            hideSheet: 'No hay hojas visibles después de ocultar esta',
        },
    },
};

export default locale;
