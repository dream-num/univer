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
    docImage: {
        title: 'Imagen',

        upload: {
            float: 'Insertar imagen',
        },

        panel: {
            title: 'Editar imagen',
        },
    },
    'image-popup': {
        replace: 'Reemplazar',
        delete: 'Eliminar',
        edit: 'Editar',
        crop: 'Recortar',
        reset: 'Restablecer tamaño',
    },
    'image-text-wrap': {
        title: 'Ajuste de texto',
        wrappingStyle: 'Estilo de ajuste',
        square: 'Cuadrado',
        topAndBottom: 'Arriba y abajo',
        inline: 'En línea con el texto',
        behindText: 'Detrás del texto',
        inFrontText: 'Delante del texto',
        wrapText: 'Ajustar texto',
        bothSide: 'Ambos lados',
        leftOnly: 'Solo izquierda',
        rightOnly: 'Solo derecha',
        distanceFromText: 'Distancia del texto',
        top: 'Arriba(px)',
        left: 'Izquierda(px)',
        bottom: 'Abajo(px)',
        right: 'Derecha(px)',
    },
    'image-position': {
        title: 'Posición',
        horizontal: 'Horizontal',
        vertical: 'Vertical',
        absolutePosition: 'Posición absoluta(px)',
        relativePosition: 'Posición relativa',
        toTheRightOf: 'a la derecha de',
        relativeTo: 'relativo a',
        bellow: 'debajo',
        options: 'Opciones',
        moveObjectWithText: 'Mover objeto con el texto',
        column: 'Columna',
        margin: 'Margen',
        page: 'Página',
        line: 'Línea',
        paragraph: 'Párrafo',
    },
    'update-status': {
        exceedMaxSize: 'El tamaño de la imagen excede el límite, el límite es {0}M',
        invalidImageType: 'Tipo de imagen no válido',
        exceedMaxCount: 'Solo se pueden subir {0} imágenes a la vez',
        invalidImage: 'Imagen no válida',
    },
};

export default locale;
