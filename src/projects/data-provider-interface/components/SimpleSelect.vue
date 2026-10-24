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
        <h4>{{ props.context.label }}</h4>
        <div class="position-relative formkitCmpWrap">
            <FormKit v-if="isEditMode.value && !isDuplicate" class="autocompleteInputfield" type="text" readonly
                :placeholder="getNode('dcat:catalog').value" :name="props.context.node.name" />
            <FormKit v-else class="autocompleteInputfield" v-model="catVal"
                :placeholder="props.context.attrs.placeholder" type="text" @click="showList = !showList"
                validation="required" mandatory="true" readonly :validation-messages="{
                    required: props.context.attrs.placeholder,
                }" :name="props.context.node.name" />

            <ul ref="dropdownList" v-show="showList" class="autocompleteResultList selectListFK catSelectList">

                <li v-for="match in filteredCatalogs" :key="match" @click="setvalue(match)"
                    class="p-2 border-b border-gray-200 data-[selected=true]:bg-blue-100 choosableItemsAC">{{
                        match.name }}
                </li>
                <li v-if="filteredCatalogs.length === 0" v-for="idMatch in userCats" :key="idMatch"
                    @click="setvalue(idMatch)"
                    class="p-2 border-b border-gray-200 data-[selected=true]:bg-blue-100 choosableItemsAC">{{
                        idMatch }}
                </li>
            </ul>
        </div>
    </div>

</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { getNode } from '@formkit/core'
import { onClickOutside } from '@vueuse/core'
import axios from 'axios'
import { useRuntimeEnv } from "../composables/useRuntimeEnv.ts";
import {
    has,
    isNil,
} from 'lodash-es';
import { FormKit } from '@formkit/vue';

const props = defineProps({
    context: Object
})



const isDuplicate = computed(()=> localStorage.getItem('dpi_duplicate'))
const userCats = computed(() => store.getters['auth/getUserCatalogIds']);
let showList = ref()
const store = useStore()
const dropdownList = ref(null)
const isEditMode = ref()
let validationTrigger = ref(true)
isEditMode.value = computed(() => store.getters['auth/getIsEditMode']);
let filteredCatalogs = ref([])
let env = useRuntimeEnv()
let catVal = ref()

catVal = getNode('dcat:catalog').value

onClickOutside(dropdownList, event => showList.value = false)

const setvalue = async (e) => {
   
    validationTrigger = false
    if (e.id) {
        props.context.node.input(e.id)
        showList.value = !showList.value;
        getNode('dcat:catalog').value = e.id
        catVal = e.name
    } else {
        props.context.node.input(e)
        showList.value = !showList.value;
        getNode('dcat:catalog').value = e
        catVal = e
    }

}
let filterCatList = async () => {
    let cache;
    await axios
        .get(env.api.baseUrl + 'search?filter=catalogue&limit=1000')
        .then(response => (cache = response))
        .catch((err) => {
            reject(err);
        });

    
    cache.data.result.results.forEach((e) => {
        console.log(cache);
        
        if (has(e, 'title') && !isNil(e.title) && has(e, 'id') && !isNil(e.id)) filteredCatalogs.value.push({ title: Object.values(e.title)[0], id: e.id })
    });

    filteredCatalogs.value = await filteredCatalogs.value
        .filter(item => userCats.value.includes(item.id))
        .map(item => ({ id: item.id, name: item.title }));

    // Check if theres only one catalog and set it directly

    let clone = JSON.parse(JSON.stringify(filteredCatalogs.value))
    if (clone.length === 1) {
        catVal = clone[0].id
    }
}


onMounted(async () => {
    filterCatList();
});

</script>
<style>
.catSelectList {
    width: 97.3% !important;
    margin: 0 1rem;
}

.selectListFK {

    max-height: 20rem;
    overflow: overlay;
    overflow-x: hidden;
}
</style>