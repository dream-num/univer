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
    'sheets-hyper-link-ui': {
        form: {
            editTitle: 'Editar Link',
            addTitle: 'Inserir Link',
            label: 'Rótulo',
            type: 'Tipo',
            link: 'Link',
            linkPlaceholder: 'Digite o link',
            range: 'Intervalo',
            worksheet: 'Planilha',
            definedName: 'Nome Definido',
            ok: 'Confirmar',
            cancel: 'Cancelar',
            labelPlaceholder: 'Digite o rótulo',
            inputError: 'Por favor, digite',
            selectError: 'Por favor, selecione',
            linkError: 'Por favor, digite um link válido',
        },
        menu: {
            add: 'Inserir Link',
        },
        permission: {
            hyperLinkErr: 'Você não tem permissão para inserir um link.',
        },
        message: {
            noSheet: 'A planilha de destino foi excluída',
            refError: 'Intervalo Inválido',
            hiddenSheet: 'Não é possível abrir o link porque a planilha vinculada está oculta',
            coped: 'Link copiado para a área de transferência',
        },
        popup: {
            copy: 'Copiar Link',
            edit: 'Editar Link',
            cancel: 'Cancelar Link',
        },
    },
};

export default locale;
