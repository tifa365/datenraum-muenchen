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
  
        <td class="font-weight-bold">{{ $t(`${value.label}`) }}</td>
        <!-- SINGULAR URL -->
        <td v-if="value.type === 'singularURL'">
          
            <a :href="data[property]">
                {{ data[property]['@type'] }}
            </a>

        </td>

        <!-- MULTI URLs -->
        <td class="d-flex align-items-center" v-if="value.type === 'multiURL' && data[property][0]['@id'] != ''">

            <div v-if="isEditMode">
                <input type="text" v-model="contentOfProp">
            </div>
            <div v-else>
             
                <div v-for="(el, index) in data[property]" :key="index">
                    <!-- regular multiple URLs -->
                    <a v-if="showValue(el, '@id')" :href="el['@id']">
                        {{ el['@id'] }}
                    </a>
                    <!-- IS USED BY -->
                    <a v-if="showValue(el, 'dext:isUsedBy')" :href="el['dext:isUsedBy']">
                        {{ el['dext:isUsedBy'] }}
                    </a>

                </div>
            </div>
            <!-- <div class="infoI" @click="editProp(property)"></div> -->
        </td>
    
</template>

<script>
import { has, isNil, isEmpty } from 'lodash-es';

export default {
    data() {
        return {
            isEditMode: false,
            contentOfProp: ''
        }

    },
    props: {
        property: String,
        value: Object,
        data: Object,
    },
    components: {
    },
    methods: {
        showValue(property, value) {
            return has(property, value) && !isNil(property[value]) && !isEmpty(property[value]);
        },
        async editProp(e) {
            if (this.isEditMode) {
                await this.$formkit.get(e).context.node.input([{ '@id': this.contentOfProp }])
            }
            else {
                this.contentOfProp = this.$formkit.get(e).context.value[0]['@id']
            }
            this.isEditMode = !this.isEditMode;

        }
    }
}
</script>
