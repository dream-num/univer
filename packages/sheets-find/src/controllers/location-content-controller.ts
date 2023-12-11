/**
 * Copyright 2023-present DreamNum Inc.
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

// export class LocationContentController {
//     private _plugin: FindPlugin;

//     private _locationData: any;

//     constructor(plugin: FindPlugin) {
//         this._plugin = plugin;

//         this._locationData = [
//             {
//                 locale: 'find.locationConstant',
//                 children: [
//                     {
//                         locale: 'find.date',
//                         disabled: true,
//                         checked: true,
//                         value: '1',
//                     },
//                     {
//                         locale: 'find.number',
//                         checked: true,
//                         value: '2',
//                     },
//                     {
//                         locale: 'find.string',
//                         checked: true,
//                         value: '3',
//                     },
//                     {
//                         locale: 'find.locationBool',
//                         checked: true,
//                         disabled: true,
//                         value: '4',
//                     },
//                     {
//                         locale: 'find.error',
//                         checked: true,
//                         value: '5',
//                     },
//                 ],
//                 value: '1',
//             },
//             {
//                 locale: 'find.locationFormula',
//                 children: [
//                     {
//                         locale: 'find.date',
//                         checked: true,
//                         disabled: true,
//                         value: '1',
//                     },
//                     {
//                         locale: 'find.number',
//                         disabled: true,
//                         checked: true,
//                         value: '2',
//                     },
//                     {
//                         locale: 'find.string',
//                         disabled: true,
//                         checked: true,
//                         value: '3',
//                     },
//                     {
//                         locale: 'find.locationBool',
//                         checked: true,
//                         disabled: true,
//                         value: '4',
//                     },
//                     {
//                         locale: 'find.error',
//                         checked: true,
//                         disabled: true,
//                         value: '5',
//                     },
//                 ],
//                 value: '2',
//             },
//             {
//                 locale: 'find.locationNull',
//                 value: '3',
//             },
//             {
//                 locale: 'find.locationCondition',
//                 value: '4',
//             },
//             {
//                 locale: 'find.locationRowSpan',
//                 value: '5',
//             },
//             {
//                 locale: 'find.locationColumnSpan',
//                 value: '6',
//             },
//         ];
//     }
// }
