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
    'docs-toc-ui': {
        tableOfContents: {
            title: 'Tabla de contenido',
            insertTitle: 'Tabla de contenido',
            automaticTitle: 'Tabla automática',
            customTitle: 'Tabla de contenido personalizada…',
            contentsTitle: 'Contenido',
            levels: 'Mostrar niveles',
            showPageNumbers: 'Mostrar números de página',
            rightAlignPageNumbers: 'Alinear números de página a la derecha',
            tabLeader: 'Carácter de relleno',
            leaderNone: 'Ninguno',
            leaderDots: 'Puntos',
            leaderDashes: 'Guiones',
            leaderUnderline: 'Subrayado',
            format: 'Formatos',
            formatFromTemplate: 'De la plantilla',
            formatClassic: 'Clásico',
            formatModern: 'Moderno',
            formatSimple: 'Sencillo',
            preview: 'Vista previa de impresión',
            previewHeading: 'Título',
            noHeadings: 'No se encontraron títulos. Aplique los estilos Título 1–3 o elija los niveles correspondientes.',
            updateTitle: 'Actualizar tabla de contenido',
            removeTitle: 'Quitar tabla de contenido',
            updatePageNumbersOnly: 'Actualizar solo los números de página',
            updateEntireTable: 'Actualizar toda la tabla',
            updateHint: 'Elija cómo actualizar esta tabla de contenido.',
        },
    },
};

export default locale;
