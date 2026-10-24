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
  <div class="repeatable formkitProperty" :class="[props.context.attrs.identifier]"
    v-for="key, repeatableIndex in counter" :key="key">
    <h4 v-if="props.context.attrs.class != undefined && props.context.attrs.class.includes('inDistribution')">{{
      $t('message.dataupload.distributions.' + props.context.attrs.identifier + '.label') }}</h4>
    <h4 v-else>{{ $t('message.dataupload.datasets.' + props.context.attrs.identifier + '.label') }}</h4>
    <div class="horizontal-wrapper">
      <div class="repeatableWrap">
        <div class="interactionHeaderRepeatable my-1">
          <i18n-t keypath="message.dataupload.info.repeatable" scope="global" tag="p">
            <template v-slot:add>
              <a class="add" @click="addItem(repeatableIndex)">+ {{ $t('message.dataupload.info.add') }}</a>
            </template>
            <template v-slot:remove>

              <a class="remove" :class="{ disabledRemove: props.context.value.length === 1 }"
                @click="removeItem(repeatableIndex, counter.length)" :data-key="key">- {{
                  $t('message.dataupload.info.remove') }}</a>
            </template>
          </i18n-t>
        </div>
        <div class="formkitWrapRepeatable">

          <slot></slot>

        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';

const props = defineProps({
  context: Object
})

const counter = ref([])

// Need to handle the data like this. The values seem to take their time while loading into the DOM.
setTimeout(() => {
  if (props.context.value.length === 0) {
    counter.value.push('init')
  }
  else {
    for (let index = 0; index < props.context.value.length; index++) {
      if (props.context.value[index] != null) {
        counter.value.push(props.context.value[index]['@value'])
      }
    }
  }
});

// Pushing a blank to the context object and refreshing the counter
const addItem = (index) => {
  counter.value.push(props.context.value[index]['@value'])

}
// remove Item - ToDo need to make sure the localhost notices the splice
const removeItem = (index, counterLength) => {

  if (counterLength != 1) {
    counter.value.splice(index, 1)
  }

}
</script>
<style scoped>
.add,
.remove {
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 5px;
  transition: all 200ms ease-in-out;
}

.add {
  border: 1px solid lightseagreen;

  &:hover {
    text-decoration: none;
    color: white;
    background-color: lightseagreen;
  }
}

.remove {
  border: 1px solid lightcoral;

  &:hover {
    text-decoration: none;
    color: white;
    background-color: lightcoral;
  }
}

.disabledRemove {
  &:hover {
    text-decoration: none;
    color: white;
    background-color: lightgray;
  }
}
</style>
