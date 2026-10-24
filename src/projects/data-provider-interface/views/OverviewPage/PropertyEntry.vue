<!--
  ~ This file is part of Civora UI.
  ~
  ~ Copyright (C) 2025 DKSR GmbH.
  ~
  ~ Civora UI is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU Affero General Public License as published by
  ~ the Free Software Foundation, version 3.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  ~ GNU Affero General Public License for more details.
  ~
  ~ You should have received a copy of the GNU Affero General Public License
  ~ along with this program. If not, see <https://www.gnu.org/licenses/>.
-->

<template>
    <div>
        <tr class="align-items-center" v-if="isSet">

            <!-- <td class=" font-weight-bold" v-if="value.type !== 'special'">{{ $t(`${value.label}`) }}:</td> -->
            <URIProp v-if="value.type === 'singularURI' || value.type === 'multiURI' || value.type === 'singularURI'"
                :property="property" :value="value" :data="data">
            </URIProp>
            <URLProp v-if="value.type === 'singularURL' || value.type === 'multiURL'" :property="property" :value="value"
                :data="data"></URLProp>
            <StringProp v-if="value.type === 'singularString' || value.type === 'multiString'" :property="property"
                :value="value" :data="data" :dpiLocale="dpiLocale"></StringProp>


            <!-- SPECIAL -->
            <div class="w-100" v-if="value.type === 'special'">
                <div v-if="property === 'dct:publisher' || property === 'dct:license'">
                    <SpecialProp :property="property" :value="value" :data="data" :dpiLocale="dpiLocale"></SpecialProp>
                </div>
                <div
                    v-else-if="property != 'dct:creator' && property != 'dcat:temporalResolution' && property != 'spdx:checksum'">
                    <div v-for="(elem, index) in data[property]" :key="index">
                        <SpecialProp :property="property" :value="value" :data="elem" :dpiLocale="dpiLocale"></SpecialProp>
                    </div>
                </div>
                <div v-else>
                    <SpecialProp :property="property" :value="value" :data="data[property]" :dpiLocale="dpiLocale">
                    </SpecialProp>
                </div>

            </div>

        </tr>
    </div>
</template>

<script>
import URIProp from './Properties/URIProp.vue';
import URLProp from './Properties/URLProp.vue';
import StringProp from './Properties/StringProp.vue';
import SpecialProp from './Properties/SpecialProp.vue';
import generalHelper from '../../utils/general-helper';

import { has, isNil, isEmpty } from 'lodash-es';

export default {
    components: {
        URIProp,
        URLProp,
        StringProp,
        SpecialProp,
    },
    props: {
        profile: String,
        data: Object,
        property: String,
        value: Object,
        dpiLocale: String,
        distId: Number,
        type: String
    },
    computed: {
        isSet() {
            return generalHelper.propertyHasValue(this.data[this.property]);
        }
    }
}
</script>
