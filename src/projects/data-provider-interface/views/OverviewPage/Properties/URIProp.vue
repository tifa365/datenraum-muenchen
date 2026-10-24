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
  <!-- <details>{{ value.label }}</details> -->
  <td class=" font-weight-bold" v-if="value.type !== 'special'">{{ $t(`${value.label}`) }}:
  </td>
  
  <!-- SINGULAR URIs -->
  <td v-if="value.type === 'singularURI' && typeof data[property] === 'string'" class=""> {{ data[property] }}</td>
  <td v-if="Object.keys(data[property]).length === 1 && value.type === 'singularURI'" class=""> {{
    data[property][0]['@id'] }} </td>
  <td v-if="value.type === 'singularURI' && typeof data[property] != 'string' && Object.keys(data[property]).length > 1"
    class=""> {{ nameOfProperty }}</td>
  <!-- MULTIPLE URIs -->
  <td v-if="value.type === 'multiURI'" class="flex-wrap d-flex multiURI">
    <div v-for="(el, index) in data[property]" :key="index" class="border shadow-sm p-2 mb-1 mr-1">
      {{ el.name }}
    </div>
  </td>
  <!-- SPECIAL CASES -->

  <td v-if="value.type === 'special' && nameOfProperty != 'Unchanged Value'" class="font-weight-bold">{{
    $t(`${value.label}`) }}:</td>
  <td v-if="value.type === 'special' && nameOfProperty != 'Unchanged Value'" class=""> {{ nameOfProperty }}</td>
  <!-- License Edge case -->
  <td v-if="value.type === 'special' && nameOfProperty != 'Unchanged Value' && value.label === 'message.metadata.license'" class=""> {{ nameOfProperty }}</td>
  <!-- <details>{{ data[property] }}</details> -->
</template>

<script>
import { mapActions } from 'vuex';
import { getTranslationFor } from "../../../utils/helpers";
import generalHelper from '../../../utils/general-helper';
import dpiConfig from '../../../config/dpi-spec-config';

export default {
  data() {
    return {
      nameOfProperty: "Unchanged Value",
      namesOfMulti: []
    }
  },
  props: {
    property: String,
    value: Object,
    data: Object,
  },
  methods: {
    ...mapActions("dpiStore", [
      "requestResourceName",
    ]),
    getTranslationFor,
    async requestURILabel(voc, res) {

      const envs = this.$env;

      if (res != undefined) {
        let vocMatch =
          this.voc === "iana-media-types" ||
          this.voc === "spdx-checksum-algorithm";

        let name;
        await this.requestResourceName({ voc: voc, uri: res, envs: envs }).then(
          (response) => {

            if (this.property === 'dcatde:politicalGeocodingURI') {
              if (response != undefined) {
                let result = vocMatch
                  ? response.data.result.results
                    .filter((dataset) => dataset.resource === res)
                    .map((dataset) => dataset.alt_label)[0].en
                  : getTranslationFor(response.data.result.alt_label, this.$i18n.locale, []);
                name = result;
              }
            } else {
              if (response != undefined) {
                let result = vocMatch
                  ? response.data.result.results
                    .filter((dataset) => dataset.resource === res)
                    .map((dataset) => dataset.pref_label)[0].en
                  : getTranslationFor(response.data.result.pref_label, this.$i18n.locale, []);
                name = result;
              }
            }
          }
        );
        // console.log(name);
        return name
      }
    },
    async getURILabel(value) {
      // only request name if there is no name already given
      // console.log('########',value);
      if (generalHelper.isUrl(value.name)) {
        
        const prefixes = dpiConfig[this.$env.content.dataProviderInterface.specification].vocabPrefixes;
        const vocabulary = Object.keys(prefixes).find(key => value.name.includes(key));
        return await this.requestURILabel(vocabulary, value.name);
      }
      else return value.name;
    }
  },
  async created() {

    try {
      if (this.value.type === 'singularURI') {
        if (typeof this.data[this.property] != 'string') {

          this.nameOfProperty = await this.getURILabel(this.data[this.property]);
        }

      } else if (this.value.type === 'multiURI') {
        for (let index = 0; index < this.data[this.property].length; index++) {
          this.data[this.property][index].name = await this.getURILabel(this.data[this.property][index]);
        }
      }
      else if (this.value.type === 'special') {

        this.nameOfProperty = await this.getURILabel(this.data[this.property]);

      }

    } catch (e) {
      console.warn(e);
    }
  },
}

</script>
<style>
div:has(>.multiURI) {
  width: 75%;
}
</style>
