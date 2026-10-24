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
    <div>
        <!-- MULTISTRING -->
        <td v-if="value.type === 'multiString'">

            <div v-for="(el, index) in data[property]" :key="index">{{ Object.values(el)[0] }}</div>
        </td>

        <!-- SINGULAR STRING -->
        <td v-if="value.type === 'singularString'">

            <span v-if="data[property]['@type'] != '' && property === 'dct:rights'">{{ data[property][Object.keys(data[property])[1]] }}</span>
            <span v-if="property != 'dct:rights'">
                {{ data[property] }} <span v-if="property === 'dcat:spatialResolutionInMeters'">Meters</span>
            </span>

        </td>

        <!-- DATES-->
        <td v-if="value.type === 'date'" class="flex-column">{{ data[property]['@value'] }}</td>

        <!-- MULTILINGUAL -->
        <td v-if="value.type === 'multiLingual'" class="flex-column">
            <div v-for="(el, index) in data[property].filter(elem => elem['@language'] === this.dpiLocale)" :key="index">
                {{ el['@value'] }}
            </div>
            <!-- <div class="multilang">This property is available in: <span v-for="(el, index) in data[property]" :key="index">({{ el['@language'] }}) </span></div> -->
        </td>
    </div>
</template>

<script>
import dateFilters from '../../../utils/dateFilters';

export default {
    props: {
        property: String,
        value: Object,
        data: Object,
        dpiLocale: String,
    },
    data() {
        return {
            availableInLocale: false,
            availableLang: [],
        }
    },
    mounted() {

        if (this.value.type === "multiLingual") {
            this.availableLang.push(this.data[this.property][0]['@language'])
        }
    },
    methods: {
        filterDateFormatEU(date) {

            return date
        },
    }

}
</script>
<style>
.multilang {
    font-size: 0.8rem;
}
</style>
