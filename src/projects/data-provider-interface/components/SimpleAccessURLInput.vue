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

import { FormKit } from '@formkit/vue';

const props = defineProps({
    context: Object
})

let URLValue

const saveUrl = async () => {

    if (this.URLValue.includes('http://') || this.URLValue.includes('https://')) {
        await this.context.node.input({ '@id': this.URLValue})
    }
    else await this.context.node.input({ '@id': 'https://' + this.URLValue })

}
</script>
<template>
    <div class="formkitProperty w-100">
        <FormKit id="aUrlLink" v-model="URLValue" class="selectInputField formkit-inner" type="url" name="@id"
            :help="props.context.help" :placeholder="props.context.attrs.placeholder"
            :validation="props.context.attrs.validationType" @input="saveUrl" />
    </div>
</template>
<style></style>