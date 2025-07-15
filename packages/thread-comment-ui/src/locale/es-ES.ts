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
    threadCommentUI: {
        panel: {
            title: 'Gestión de comentarios',
            empty: 'Aún no hay comentarios',
            filterEmpty: 'Sin resultados coincidentes',
            reset: 'Restablecer filtro',
            addComment: 'Añadir comentario',
            solved: 'Resuelto',
        },
        editor: {
            placeholder: 'Responde o añade a otros con @',
            reply: 'Comentar',
            cancel: 'Cancelar',
            save: 'Guardar',
        },
        item: {
            edit: 'Editar',
            delete: 'Eliminar este comentario',
        },
        filter: {
            sheet: {
                all: 'Todas las hojas',
                current: 'Hoja actual',
            },
            status: {
                all: 'Todos los comentarios',
                resolved: 'Resueltos',
                unsolved: 'No resueltos',
                concernMe: 'Me concierne',
            },
        },
    },
};

export default locale;
