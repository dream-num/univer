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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    'find-replace': {
        toolbar: 'Find & Replace',
        shortcut: {
            'open-find-dialog': 'Open Find Dialog',
            'open-replace-dialog': 'Open Replace Dialog',
            'close-dialog': 'Close Find & Replace Dialog',
            'go-to-next-match': 'Go to Next Match',
            'go-to-previous-match': 'Go to Previous Match',
            'focus-selection': 'Focus Selection',
        },
        dialog: {
            title: 'Find',
            find: 'Find',
            replace: 'Replace',
            'replace-all': 'Replace All',
            'case-sensitive': 'Case Sensitive',
            'find-placeholder': 'Find in this Sheet',
            'advanced-finding': 'Advanced Searching & Replace',
            'replace-placeholder': 'Input Replace String',
            'match-the-whole-cell': 'Match the Whole Cell',
            'find-direction': {
                title: 'Find Direction',
                row: 'Search by Row',
                column: 'Search by Column',
            },
            'find-scope': {
                title: 'Find Range',
                'current-sheet': 'Current Sheet',
                workbook: 'Workbook',
            },
            'find-by': {
                title: 'Find By',
                value: 'Find by Value',
                formula: 'Find Formula',
            },
            'no-match': 'Finding completed but no match found.',
            'no-result': 'No Result',
        },
        replace: {
            'all-success': 'Replaced all {0} matches',
            'all-failure': 'Replace failed',
            confirm: {
                title: 'Are you sure to replace all matches?',
            },
        },
    },
    'find-replace-shortcuts': 'Find & Replace',
};

export default locale;
