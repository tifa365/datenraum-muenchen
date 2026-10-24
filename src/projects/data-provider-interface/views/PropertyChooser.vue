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
    <div class="propertyChooser">
       
        <!-- ToDo Weblate translations -->
        <div v-if="step ==='recommended'">
            <h4>Recommended properties</h4>
            The following properties are decribing recommended Informations regarding the dataset. If you'd like to
            display any of the properties in the following list, just klick them. You can also find information on them when
            you hover over the<div class="infoI d-inline-block"></div>symbol.
        </div>
        <div v-if="step ==='advised'">
            <h4>Advised properties</h4>
            The following properties are decribing advised Informations regarding the dataset. If you'd like to
            display any of the properties in the following list, just klick them. You can also find information on them when
            you hover over the<div class="infoI d-inline-block"></div>symbol.
        </div>
        <hr>
        <ul>
            <li v-for="items in properties" :key="items" class="">
                <div class="infoI">
                    <div class="tooltipFormkit">{{ items.help }}</div>
                </div> {{ camel2title(items.identifier) }}
            </li>
        </ul>
        <hr>
    </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        properties: {},
        step:"",
    },
    data() {
        return {
            camel2title: (str) =>
                str
                    .replace(/([A-Z])/g, (match) => ` ${match}`)
                    .replace(/^./, (match) => match.toUpperCase())
                    .trim(),
        }
    }
});

</script>
<style></style>