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
    'thread-comment-ui': {
        panel: {
            title: 'Gerenciamento de Comentários',
            empty: 'Nenhum comentário ainda',
            filterEmpty: 'Nenhum resultado correspondente',
            reset: 'Redefinir Filtro',
            addComment: 'Adicionar Comentário',
            solved: 'Resolvido',
        },
        editor: {
            placeholder: 'Responder ou mencionar outros com @',
            reply: 'Comentar',
            cancel: 'Cancelar',
            save: 'Salvar',
        },
        item: {
            edit: 'Editar',
            delete: 'Excluir Este Comentário',
        },
        filter: {
            sheet: {
                all: 'Todas as planilhas',
                current: 'Planilha atual',
            },
            status: {
                all: 'Todos os comentários',
                resolved: 'Resolvidos',
                unsolved: 'Não resolvidos',
                concernMe: 'Me envolvem',
            },
        },
    },
};

export default locale;
