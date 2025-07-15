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
    docLink: {
        edit: {
            confirm: 'Confirmar',
            cancel: 'Cancelar',
            title: 'Enlace',
            address: 'Enlace',
            placeholder: 'Por favor, introduce una URL',
            addressError: '¡La URL no es válida!',
            label: 'Etiqueta',
            labelError: 'Por favor, introduce la etiqueta del enlace',
        },
        info: {
            copy: 'Copiar',
            edit: 'Editar',
            cancel: 'Eliminar enlace',
            coped: 'Enlace copiado al portapapeles',
        },
        menu: {
            tooltip: 'Añadir enlace',
        },
    },
};

export default locale;
