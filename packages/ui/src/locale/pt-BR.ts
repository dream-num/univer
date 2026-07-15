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
                6: 'Título 6',
                tooltip: 'Definir Título',
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
            arial: 'Arial',
            'times-new-roman': 'Times New Roman',
            tahoma: 'Tahoma',
            verdana: 'Verdana',
            'microsoft-yahei': 'Microsoft YaHei',
            simsun: 'SimSun',
            simhei: 'SimHei',
            kaiti: 'Kaiti',
            fangsong: 'FangSong',
            nsimsun: 'NSimSun',
            stxinwei: 'STXinwei',
            stxingkai: 'STXingkai',
            stliti: 'STLiti',
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
        textEditor: {
            formulaError: 'Digite uma fórmula válida, como =SUM(A1)',
            rangeError: 'Digite um intervalo válido, como A1:B10',
        },
        rangeSelector: {
            title: 'Selecione um intervalo de dados',
            addAnotherRange: 'Adicionar intervalo',
            buttonTooltip: 'Selecionar intervalo de dados',
            placeHolder: 'Selecione o intervalo ou digite.',
            confirm: 'Confirmar',
            cancel: 'Cancelar',
        },
        'global-shortcut': 'Atalho Global',
        'zoom-slider': {
            resetTo: 'Redefinir para',
        },
        row: 'Linha',
        column: 'Coluna',
    },
};

export default locale;
