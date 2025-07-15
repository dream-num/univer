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
    hyperLink: {
        form: {
            editTitle: 'Editar enlace',
            addTitle: 'Insertar enlace',
            label: 'Etiqueta',
            type: 'Tipo',
            link: 'Enlace',
            linkPlaceholder: 'Introduce el enlace',
            range: 'Rango',
            worksheet: 'Hoja de cálculo',
            definedName: 'Nombre definido',
            ok: 'Confirmar',
            cancel: 'Cancelar',
            labelPlaceholder: 'Introduce la etiqueta',
            inputError: 'Por favor, introduce',
            selectError: 'Por favor, selecciona',
            linkError: 'Por favor, introduce un enlace válido',
        },
        menu: {
            add: 'Insertar enlace',
        },
        message: {
            noSheet: 'La hoja de destino ha sido eliminada',
            refError: 'Rango no válido',
            hiddenSheet: 'No se puede abrir el enlace porque la hoja enlazada está oculta',
            coped: 'Enlace copiado al portapapeles',
        },
        popup: {
            copy: 'Copiar enlace',
            edit: 'Editar enlace',
            cancel: 'Cancelar enlace',
        },
    },
};

export default locale;
