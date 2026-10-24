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

<script setup lang="ts">
/**
 * `SelectControlledGroup` is a Vue component wrapping the FormKit group input. 
 * It features a central select input that dictates the behavior of all child inputs within the group. 
 * This setup allows for conditional display and interaction of child components based on the select input's value. 
 * 
 * Note that this is not a FormKit input itself, but rather a wrapper around the FormKit group input.
 */

import { reactive } from 'vue';
import { FormKit } from '@formkit/vue';

const props = defineProps<{
  name?: string;
  selectName: string;
  initialValue?: string;
  options: Record<string, string>;
  index?: number;
  id?: any;
  label?: string;
  placeholder?: string;
  info?: string;
}>();

const data = reactive({
  groupValue: {},
  selectValue: props.initialValue ?? Object.keys(props.options)[0],
});
</script>

<template>
  <div class="formkitProperty">
    <h4>{{ props.label }}</h4>
    <div class="formkitCmpWrap  d-flex">
      <FormKit :id="props.id" type="group" :name="name" :index="props.index" v-model="data.groupValue">
        <FormKit v-model="data.selectValue" type="select" :options="props.options" :name="props.selectName">
          <template #prefix>
            <div v-if="props.info" class="infoI">
              <div class="tooltipFormkit">
                {{ props.info }}
              </div>
            </div>
          </template>
        </FormKit>
        <slot :select-value="data.selectValue" />
      </FormKit>
    </div>

  </div>

</template>