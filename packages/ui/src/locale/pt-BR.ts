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
import emojiLocale from './emoji-locale/pt-BR.generated';

const locale: typeof enUS = {
    ui: {
        objectPermission: {
            operationDenied: 'Este conteúdo está protegido. Esta ação não é permitida.',
            remove: 'Remover proteção',
            roleOwner: 'Proprietário do arquivo',
            roleEditor: 'Editor do arquivo',
            selectedCount: 'Selecionados: {0}',
            searchPeople: 'Buscar pessoas',
            noMatchingPeople: 'Nenhuma pessoa correspondente',
            loadMore: 'Carregar mais',
            fileHint: 'O compartilhamento do arquivo define os membros. Estas configurações restringem as ações desses membros.',
            documentParent: 'As restrições de edição do documento também se aplicam a esta seção.',
            paragraphParent: 'As restrições de edição do documento e da seção que contém este parágrafo também se aplicam.',
            documentObjectParent: 'O documento e as seções e parágrafos que contêm ou ancoram este objeto também podem restringir sua edição.',
            slideParent: 'As restrições de edição da apresentação também se aplicam.',
            slideObjectParent: 'As restrições de edição da apresentação e do slide ou mestre que contém este objeto também se aplicam.',
            baseParent: 'As restrições de edição do Base também se aplicam.',
            baseObjectParent: 'As restrições de edição do Base e da tabela que contém este objeto também se aplicam.',
            recordParent: 'As restrições do Base e da tabela continuam válidas. Editar um valor também requer permissão para seu campo.',
            boardParent: 'As restrições de edição do quadro também se aplicam a este objeto.',
            ownerInherit: 'Proprietário do arquivo, acesso herdado',
            peopleError: 'Não foi possível carregar as pessoas. Tente novamente.',
            document: 'Documento',
            section: 'Seção',
            paragraph: 'Parágrafo',
            entity: 'Objeto',
            presentation: 'Apresentação',
            page: 'Slide',
            master: 'Exibição mestre',
            base: 'Base',
            table: 'Tabela',
            field: 'Campo',
            record: 'Registro',
            view: 'Exibição',
            board: 'Quadro',
            objectName: '{0}: {1}',

            search: 'Buscar objetos',
            empty: 'Nenhum objeto correspondente',
            more: 'Exibindo os primeiros 100 objetos. Use a busca para refinar a lista.',
            title: 'Permissões',
            cancel: 'Cancelar',
            save: 'Salvar',
            saving: 'Salvando…',
            loading: 'Carregando…',
            conflict: 'As permissões foram alteradas. Recarregue antes de salvar.',
            error: 'Não foi possível carregar ou salvar as permissões. Suas alterações foram mantidas.',
            reload: 'Recarregar',
            denied: 'Você não pode gerenciar as permissões deste objeto.',
            edit: 'Quem pode editar',
            all: 'Todos os editores do arquivo',
            owner: 'Apenas o proprietário do objeto',
            members: 'Membros selecionados',
            copy: 'Permitir que editores copiem',
            print: 'Permitir que editores imprimam',
            export: 'Permitir que editores exportem',
            comment: 'Permitir que editores comentem',
            parentHint: 'As restrições do arquivo e do objeto pai continuam válidas.',
        },
        featureSearch: {
            title: 'Pesquisar recursos',
            placeholder: 'Digite um recurso ou nome de menu...',
            empty: 'Nenhum recurso disponível encontrado',
            ribbon: 'Faixa de opções',
            contextMenu: 'Menu de contexto',
        },
        emojiPicker: {
            search: 'Buscar',
            random: 'Emoji aleatório',
            recents: 'Recentes',
            emojis: 'Emojis',
            animals: 'Animais',
            food: 'Comida',
            activities: 'Atividades',
            places: 'Lugares',
            objects: 'Objetos',
            symbols: 'Símbolos',
            searchResults: 'Resultados da busca',
            noResults: 'Nenhum emoji encontrado',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'Matemática',
            greek: 'Grego',
            common: 'Comuns',
        },
        toolbar: {
            heading: {
                normal: 'Normal',
                title: 'Título',
                subTitle: 'Subtítulo',
                1: 'Título 1',
                2: 'Título 2',
                3: 'Título 3',
                4: 'Título 4',
                5: 'Título 5',
            },
        },
        ribbon: {
            start: 'Início',
            startDesc: 'Inicie a planilha e defina os parâmetros básicos.',
            insert: 'Inserir',
            insertDesc: 'Insira linhas, colunas, gráficos e vários outros elementos.',
            formulas: 'Fórmulas',
            formulasDesc: 'Use funções e fórmulas para cálculos de dados.',
            data: 'Dados',
            dataDesc: 'Gerencie dados, incluindo importação, classificação e filtragem.',
            view: 'Exibir',
            viewDesc: 'Alterne modos de exibição e ajuste o efeito de visualização.',
            others: 'Outros',
            othersDesc: 'Outras funções e configurações.',
            more: 'Mais',
        },
        fontFamily: {
            'not-supported': 'Fonte não encontrada no sistema, usando a fonte padrão.',
        },
        'shortcut-panel': {
            title: 'Atalhos',
        },
        shortcut: {
            undo: 'Desfazer',
            redo: 'Refazer',
            cut: 'Recortar',
            copy: 'Copiar',
            paste: 'Colar',
            'shortcut-panel': 'Alternar Painel de Atalhos',
        },
        'common-edit': 'Atalhos Comuns de Edição',
        'toggle-shortcut-panel': 'Alternar Painel de Atalhos',
        navigation: {
            back: 'Voltar',
            previous: 'Anterior',
            next: 'Próximo',
        },
        sidebar: {
            panel: 'Painel lateral',
            resize: 'Redimensionar o painel lateral',
            close: 'Fechar o painel lateral',
        },
        beforeClose: {
            title: 'Algumas alterações não foram salvas',
        },
        clipboard: {
            authentication: {
                title: 'Permissão Negada',
                content: 'Permita que o Univer acesse sua área de transferência.',
            },
        },
        rangeSelector: {
            cancel: 'Cancelar',
        },
        'global-shortcut': 'Atalho Global',
        row: 'Linha',
        column: 'Coluna',
    },
};

export default locale;
