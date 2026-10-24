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
    <div v-if="value.type === 'conditional'">
        <!-- PUBLISHER -->
        <div v-if="property === 'dct:publisher'">
            <details>{{ value }}</details>
            
<!--             
            <div v-if="!data[property][0]['resource']">
                <details>{{ data[property][0]['name'] }}</details>
                <td>
                    <div v-if="showValue(data[property][0], 'foaf:name')">
                        <span class="">{{ $t('message.dataupload.datasets.publisherName.label') }}:</span>
                        {{ data[property][0]['foaf:name'] }}

                    </div>
                    <div v-if="showValue(data[property][0], 'foaf:mbox')" class="pr-1">

                        <span class="">{{ $t('message.dataupload.datasets.publisherEmail.label') }}:</span>
                        <app-link class="w-100" :to="data[property][0]['foaf:mbox']">{{ data[property][0]['foaf:mbox']
                        }}</app-link>
                    </div>
                    <div v-if="showValue(data[property][0], 'foaf:homepage')" class="pr-1">

                        <span class="">{{ $t('message.dataupload.datasets.publisherHomepage.label') }}:</span>
                        <app-link class="w-100" :to="data[property][0]['foaf:homepage']">{{
                            data[property][0]['foaf:homepage'] }}</app-link>
                    </div>
                </td>
            </div>
            <div v-else>
                {{ value.type = 'singularURI' }}
                <URIProp :property="property" :value="value" :data="data">{{ value.type }}</URIProp>
            </div> -->
        </div>

    </div>
</template>

<script>
import { has, isNil, isEmpty } from 'lodash-es';

export default {
    props: {
        property: String,
        value: Object,
        data: undefined,
    },
    components: {
    },
    methods: {
        showValue(property, value) {
            return has(property, value) && !isNil(property[value]) && !isEmpty(property[value]);
        },
    }

}
</script>
