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
   
    <!-- TITLE -->
      <div class="mt-4 mb-2" v-if="getData('catalogues')['dct:title']">
        <div class="row">
          <div class="col-8 offset-1">
            <h2>
              {{getData('catalogues')['dct:title'].filter(el => el['@language'] === dpiLocale).map(el => el['@value'])[0]}}
            </h2>
          </div>
        </div>
      </div>

      <!-- DESCRIPTION -->
      <div class="mt-2" v-if="getData('catalogues')['dct:description']">
        <div class="row">
          <div class="col-10 offset-1">
            <p>
              {{getData('catalogues')['dct:description'].filter(el => el['@language'] === dpiLocale).map(el => el['@value'])[0]}}
            </p>
          </div>
        </div>
        <hr>
      </div>

      <!-- INFO TABLE -->
      <div class="mt-5">
        <div class="row">
          <div class="col-10 offset-1 py-2 bg-white">
            <h2 class="heading">{{ $t('message.datasetDetails.additionalInfo') }}</h2>
          </div>
          <div class="col-10 offset-1">
            <table class="table table-borderless table-responsive pl-3 bg-light">

              <div v-for="(value, name, index) in tableProperties" :key="index" class="catOverviewTable">
                  <PropertyEntry :data="getData('catalogues')" profile="catalogues" :property="name" :value="value" :dpiLocale="dpiLocale"></PropertyEntry>
              </div>

            </table>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import PropertyEntry from './PropertyEntry.vue';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      tableProperties: {
        'dct:publisher': {type: 'conditional', voc: 'corporate-body', label: 'message.metadata.publisher' },
        'foaf:homepage': {type: 'singularURI', voc: '', label: 'message.metadata.homepage'},
        'dct:language': { type: 'multiURI', voc: 'language', label: 'message.metadata.languages' },
        'dct:license': {type: 'singularURI', voc: '', label: 'message.metadata.license'},
        'dct:spatial': { type: 'special', voc: '', label: 'message.metadata.spatial' },
        'dct:creator': {type: 'special', voc: '', label: 'message.metadata.creator'},
        'dct:hasPart': {type: 'multiURL', voc: '', label:'message.dataupload.catalogues.hasPart.label'},
        'dct:isPartOf': {type: 'singularURI', voc: '', label:'message.metadata.isPartOf'},
        'dcat:catalog': {type: 'multiURL', voc: '', label:'message.dataupload.catalogues.catalog.label'},
        'dct:rights': {type: 'singularString', voc: '', label:'message.metadata.rights'},
      }
    }
  },
  props: {
      dpiLocale: String,
  },
  components: {
      PropertyEntry,
  },
  computed: {
        ...mapGetters('dpiStore', [
            'getData',
        ]),
    }
}
</script>

<style>

</style>