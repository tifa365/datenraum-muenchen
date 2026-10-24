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
  <div class="formkitProperty">

      <h4 v-if="!props.context.attrs.insideRepeatable && !inDis">{{ $t('message.dataupload.datasets.' +
          props.context.attrs.identifier + '.label') }}</h4>
      <h4 v-if="inDis">
          {{ $t('message.dataupload.distributions.' +
              props.context.attrs.identifier + '.label') }}</h4>
      <div class="position-relative formkitCmpWrap">
          <FormKit class="autocompleteInputfield" :identifier="props.context.attrs.identifier"
              :name="props.context.node.name" :help="props.context.help"
              :placeholder="props.context.attrs.placeholder" :validation="props.context.attrs.validationType" />
      </div>
  </div>
</template>
<script setup>

import { FormKit } from '@formkit/vue';
import { ref, computed } from 'vue';

const props = defineProps({
  context: Object
})
// Need to make  sure, that the right header gets displayed
let inDis = computed(() => {
  try {
      if (props.context.attrs.class.includes("inDistribution")) {
          return true
      }
  } catch (error) {

  }


});



</script>
<style></style>