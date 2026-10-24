/*
 * This file is part of Civora UI.
 *
 * Copyright (C) 2025 DKSR GmbH.
 *
 * Civora UI is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import Repeatable from "./Repeatable.vue";
import FormKitGroup from "./FormKitGroup.vue";
import { type FormKitLibrary } from "@formkit/core";
import AutocompleteInput from "../components/AutocompleteInput.vue";
import FileUpload from "../components/FileUpload.vue";
import UniqueIdentifierInput from "../components/UniqueIdentifierInput.vue";
import SpatialInput from "../components/SpatialInput.vue";
import ConditionalInput from "../components/ConditionalInput.vue";
import SimpleSelect from "../components/SimpleSelect.vue";
import SimpleInput from "../components/SimpleInput.vue";
import SimpleAccessURLInput from "../components/SimpleAccessURLInput.vue";

export default {
  
    repeatable: {
        type: 'list',
        component: Repeatable
    },
    id: {
        type: 'input',
        component: UniqueIdentifierInput,
    },
    auto: {
        type: 'group',
        component: AutocompleteInput
    },
    fileupload: {
        type: 'group',
        component: FileUpload
    },
    spatialinput: {
        type: 'group',
        component: SpatialInput
    },
    formkitGroup: {
        type: 'group',
        component: FormKitGroup
    },
    simpleConditional: {
        type: 'group',
        component: ConditionalInput
    },
    simpleSelect: {
        type: 'input',
        component: SimpleSelect,
    },
    simpleInput: {
        type: 'input',
        component: SimpleInput,
    },
    simpleAccessURLInput: {
        type: 'group',
        component: SimpleAccessURLInput,
    },


} as FormKitLibrary;