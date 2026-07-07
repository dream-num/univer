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
    'drawing-ui': {
        'image-cropper': {
            error: 'No se pueden recortar objetos que no sean imágenes.',
        },
        objectListPanel: {
            title: 'Objetos',
            empty: 'Sin objetos',
            showAll: 'Mostrar todo',
            hideAll: 'Ocultar todo',
            moveForward: 'Traer hacia delante',
            moveBackward: 'Enviar hacia atras',
            close: 'Cerrar',
            show: 'Mostrar',
            hide: 'Ocultar',
            lock: 'Bloquear',
            unlock: 'Desbloquear',
            name: 'Nombre',
            nameInput: 'Nombre del objeto',
            description: 'Descripcion',
            descriptionPlaceholder: 'Agregar descripcion',
            details: 'Detalles',
            locate: 'Localizar',
            expand: 'Expandir',
            collapse: 'Contraer',
            dragToReorder: 'Arrastre para reordenar',
            search: 'Buscar objetos',
            filterAll: 'Todo',
            filterHidden: 'Ocultos',
            filterLocked: 'Bloqueados',
            sectionCanvas: 'Capa de lienzo',
            sectionFloating: 'Capa flotante',
            typeNames: {
                object: 'Objeto',
                shape: 'Forma',
                connector: 'Conector',
                image: 'Imagen',
                chart: 'Gráfico',
                table: 'Tabla',
                smartArt: 'SmartArt',
                video: 'Vídeo',
                group: 'Grupo',
                unit: 'Unidad',
                dom: 'DOM',
                text: 'Texto',
                placeholder: 'Marcador de posición',
                container: 'Contenedor',
            },
            noSelection: 'Seleccione un objeto para editar sus detalles',
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
        'image-popup': {
            replace: 'Reemplazar',
            delete: 'Eliminar',
            edit: 'Editar',
            crop: 'Recortar',
            reset: 'Restablecer tamaño',
        },
    },
};

export default locale;
