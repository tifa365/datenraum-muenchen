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

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { isNil } from 'lodash-es';
import axios from 'axios';
import { useStore } from 'vuex';
import { getCurrentInstance } from "vue";
import { useI18n } from 'vue-i18n';
let env = getCurrentInstance().appContext.app.config.globalProperties.$env;

const store = useStore();
const isEditMode = ref();
const isDuplicate = ref();
isDuplicate.value = localStorage.getItem('dpi_duplicate');
isEditMode.value = store.getters['auth/getIsEditMode'];
const { t, locale } = useI18n();

let validationMessages = {
  idformatvalid: "",
  idunique: "",
  required: ""

};

onMounted(() => {
  // This is kind of buggy, its taking the strings from the wrong json (de and en is switched)
  validationMessages = {
    idformatvalid: t('message.dataupload.datasets.datasetID.invalidFormat'),
    idunique: t('message.dataupload.datasets.datasetID.duplicate'),
    required: t('message.dataupload.datasets.datasetID.required')
  };

});


watchEffect(() => {


});



async function idunique(node) {
  let isUniqueID = true;
  let hubUrl = env.api.hubUrl;
  const draftIDs = store.getters['auth/getUserDraftIds'];

  new Promise(() => {
    if (isNil(node.value) || node.value === '' || node.value === undefined) isUniqueID = true;
    else if (draftIDs.includes(node.value)) isUniqueID = false;
    else {
      const request = `${hubUrl}datasets/${node.value}?useNormalizedId=true`;
      axios.head(request)
        .then(() => {
          isUniqueID = false;
        })
        .catch((e) => {
          isUniqueID = true;
        });
    }
  });
  return isUniqueID;
}

function idformatvalid(node) {
  return /^[a-z0-9-]*$/.test(node.value);
}

</script>

<template>
  <div class="formkitProperty DSid">
    <h4>{{ $t(`message.dataupload.datasets.datasetID.label`) }}</h4>
    <FormKit v-if="!isEditMode || isDuplicate" type="text" name="datasetID" id="datasetID"
      :placeholder="$t(`message.dataupload.datasets.datasetID.label`)"
      :info="$t(`message.dataupload.datasets.datasetID.info`)" :help="$t(`message.dataupload.datasets.datasetID.help`)"
      :validation-rules="{ idformatvalid, idunique }" validation="idformatvalid|idunique|required"
      validation-visibility="live" :validation-messages="validationMessages" outer-class="formkitCmpWrap p-3">
    </FormKit>
    <FormKit v-else type="text" name="datasetID" id="datasetID" :disabled="true"
      :info="$t(`message.dataupload.datasets.datasetID.info`)" :help="$t(`message.dataupload.datasets.datasetID.help`)">
    </FormKit>
  </div>
</template>

<script>
export default {
  props: ['context']
}
</script>

<style></style>
