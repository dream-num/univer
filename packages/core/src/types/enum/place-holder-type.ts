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

export enum PlaceholderType {
    NONE, //Default value, signifies it is not a placeholder.
    BODY, //Body text.
    CHART, //Chart or graph.
    CLIP_ART, //Clip art image.
    CENTERED_TITLE, //Title centered.
    DIAGRAM, //Diagram.
    DATE_AND_TIME, //Date and time.
    FOOTER, //Footer text.
    HEADER, //Header text.
    MEDIA, //Multimedia.
    OBJECT, //Any content type.
    PICTURE, //Picture.
    SLIDE_NUMBER, //Number of a slide.
    SUBTITLE, //Subtitle.
    TABLE, //Table.
    TITLE, //Slide title.
    SLIDE_IMAGE, //Slide image.
}
