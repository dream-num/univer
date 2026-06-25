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
    'find-replace': {
        toolbar: 'Localizar e Substituir',
        shortcut: {
            'open-find-dialog': 'Abrir Caixa de Localização',
            'open-replace-dialog': 'Abrir Caixa de Substituição',
            'close-dialog': 'Fechar Caixa de Localizar e Substituir',
            'go-to-next-match': 'Ir para Próxima Correspondência',
            'go-to-previous-match': 'Ir para Correspondência Anterior',
            'focus-selection': 'Focar Seleção',
            panel: 'Localizar e Substituir',
        },
        dialog: {
            title: 'Localizar',
            find: 'Localizar',
            replace: 'Substituir',
            'replace-all': 'Substituir Tudo',
            'case-sensitive': 'Diferenciar Maiúsculas/Minúsculas',
            'find-placeholder': 'Localizar nesta Planilha',
            'advanced-finding': 'Pesquisa e Substituição Avançadas',
            'replace-placeholder': 'Digite o Texto de Substituição',
            'match-the-whole-cell': 'Corresponder à Célula Inteira',
            'find-direction': {
                title: 'Direção da Pesquisa',
                row: 'Pesquisar por Linha',
                column: 'Pesquisar por Coluna',
            },
            'find-scope': {
                title: 'Intervalo da Pesquisa',
                'current-sheet': 'Planilha Atual',
                workbook: 'Pasta de Trabalho',
            },
            'find-by': {
                title: 'Pesquisar Por',
                value: 'Pesquisar por Valor',
                formula: 'Localizar Fórmula',
            },
            'no-match': 'Pesquisa concluída, mas nenhuma correspondência foi encontrada.',
            'no-result': 'Nenhum Resultado',
        },
        replace: {
            'all-success': 'Substituídas todas as {0} correspondências',
            'partial-success': '{0} correspondências substituídas, falha ao substituir {1}',
            'all-failure': 'Falha na substituição',
            confirm: {
                title: 'Tem certeza de que deseja substituir todas as correspondências?',
            },
        },
        button: {
            confirm: 'OK',
            cancel: 'Cancelar',
        },
    },
};

export default locale;
