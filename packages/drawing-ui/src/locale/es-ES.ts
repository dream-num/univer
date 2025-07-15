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
    'image-popup': {
        replace: 'Reemplazar',
        delete: 'Eliminar',
        edit: 'Editar',
        crop: 'Recortar',
        reset: 'Restablecer tamaño',
    },
    'image-cropper': {
        error: 'No se pueden recortar objetos que no sean imágenes.',
    },
    'image-panel': {
        arrange: {
            title: 'Organizar',
            forward: 'Traer adelante',
            backward: 'Enviar atrás',
            front: 'Traer al frente',
            back: 'Enviar al fondo',
        },
        transform: {
            title: 'Transformar',
            rotate: 'Rotar (°)',
            x: 'X (px)',
            y: 'Y (px)',
            width: 'Ancho (px)',
            height: 'Alto (px)',
            lock: 'Bloquear proporción (%)',
        },
        crop: {
            title: 'Recortar',
            start: 'Iniciar recorte',
            mode: 'Libre',
        },
        group: {
            title: 'Agrupar',
            group: 'Agrupar',
            reGroup: 'Reagrupar',
            unGroup: 'Desagrupar',
        },
        align: {
            title: 'Alinear',
            default: 'Seleccionar tipo de alineación',
            left: 'Alinear a la izquierda',
            center: 'Alinear al centro',
            right: 'Alinear a la derecha',
            top: 'Alinear arriba',
            middle: 'Alinear al medio',
            bottom: 'Alinear abajo',
            horizon: 'Distribuir horizontalmente',
            vertical: 'Distribuir verticalmente',
        },
        null: 'Ningún objeto seleccionado',
    },
    'drawing-view': 'Dibujo',
    shortcut: {
        'drawing-move-down': 'Mover dibujo hacia abajo',
        'drawing-move-up': 'Mover dibujo hacia arriba',
        'drawing-move-left': 'Mover dibujo a la izquierda',
        'drawing-move-right': 'Mover dibujo a la derecha',
        'drawing-delete': 'Eliminar dibujo',
    },
};

export default locale;
