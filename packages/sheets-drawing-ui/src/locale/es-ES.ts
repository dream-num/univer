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
    sheetImage: {
        title: 'Imagen',

        upload: {
            float: 'Imagen flotante',
            cell: 'Imagen de celda',
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
    'drawing-anchor': {
        title: 'Propiedades de anclaje',
        both: 'Mover y cambiar tamaño con las celdas',
        position: 'Mover pero no cambiar tamaño con las celdas',
        none: 'No mover ni cambiar tamaño con las celdas',
    },
    'update-status': {
        exceedMaxSize: 'El tamaño de la imagen supera el límite, el límite es {0}M',
        invalidImageType: 'Tipo de imagen no válido',
        exceedMaxCount: 'Solo se pueden subir {0} imágenes a la vez',
        invalidImage: 'Imagen no válida',
    },
    'cell-image': {
        pasteTitle: 'Pegar como imagen de celda',
        pasteContent: 'Pegar una imagen de celda sobrescribirá el contenido existente de la celda, continuar pegando',
        pasteError: 'La copia y pegado de imágenes de celda de hoja no está soportada en esta unidad',
    },
};

export default locale;
