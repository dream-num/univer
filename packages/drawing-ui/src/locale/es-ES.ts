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
        ole: {
            progressReading: 'Leyendo el archivo adjunto…',
            progressUploading: 'Subiendo el archivo adjunto…',
            progressCreating: 'Creando el archivo en línea…',
            progressSaving: 'Guardando el enlace…',
            externalAttachment: 'Archivo adjunto vinculado',
            externalHint: 'El archivo original de este adjunto no está incrustado en el documento. La vista previa y la descarga no están disponibles.',
            missingHint: 'Faltan los datos de este adjunto en el documento. La vista previa y la descarga no están disponibles.',
            unavailableSummary: 'Este documento contiene {0} archivos adjuntos no disponibles. Se han conservado sus marcadores. Pase el cursor sobre el icono de advertencia para ver el motivo.',
            rename: 'Cambiar nombre',
            saveName: 'Guardar nombre',
            cancel: 'Cancelar',
            invalidName: 'Escribe un nombre de archivo válido de hasta 255 caracteres.',
            renameFailed: 'No se pudo cambiar el nombre del adjunto. Inténtalo de nuevo.',
            actions: 'Acciones del archivo adjunto',
            linkSaveFailed: 'Se creó el archivo en línea, pero no se pudo guardar el enlace. Reintenta guardar el enlace.',
            conversionFailed: 'No se pudo convertir este archivo adjunto. Inténtalo de nuevo.',
            converted: 'Conversión completada. Puedes abrir el archivo en línea en una pestaña nueva.',
            converting: 'Convirtiendo…',
            openSlide: 'Abrir la presentación en línea en una pestaña nueva',
            openDoc: 'Abrir el documento en línea en una pestaña nueva',
            openSheet: 'Abrir la hoja de cálculo en línea en una pestaña nueva',
            convertSlide: 'Convertir en presentación en línea',
            convertDoc: 'Convertir en documento en línea',
            convertSheet: 'Convertir en hoja de cálculo en línea',
            nativePreviewHint: 'Si el navegador no puede mostrar el archivo, descarga el original.',
            attachment: 'Archivo adjunto OLE',
            external: 'Archivo externo no disponible',
            missing: 'Datos del archivo adjunto no disponibles',
            opaque: 'Binario OLE original (descarga disponible)',
            download: 'Descargar',
            preview: 'Vista previa',
            remove: 'Eliminar',
            failed: 'No se puede leer el archivo adjunto original. Inténtalo de nuevo.',
            unsupported: 'La vista previa no está disponible para este archivo. Puedes descargar el original.',
        },
        mobile: { close: 'Cerrar', more: 'Más' },
        'image-cropper': {
            error: 'No se pueden recortar objetos que no sean imágenes.',
        },
        objectListPanel: {
            title: 'Capas',
            empty: 'Sin objetos',
            showAll: 'Mostrar todo',
            hideAll: 'Ocultar todo',
            lockAll: 'Bloquear todo',
            unlockAll: 'Desbloquear todo',
            moveForward: 'Traer hacia delante',
            moveBackward: 'Enviar hacia atras',
            close: 'Cerrar',
            show: 'Mostrar',
            hide: 'Ocultar',
            lock: 'Bloquear',
            unlock: 'Desbloquear',
            lockHint: 'Bloquear para evitar selecciones accidentales',
            unlockHint: 'Bloqueado. Haz clic para desbloquear',
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
                cancel: 'Cancelar',
                apply: 'Listo',
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
            square: 'Cuadrado',
            topAndBottom: 'Arriba y abajo',
            inline: 'En línea con el texto',
            behindText: 'Detrás del texto',
            inFrontText: 'Delante del texto',
        },
    },
};

export default locale;
