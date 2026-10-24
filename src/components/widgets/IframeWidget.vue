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
const props = defineProps({
  iframeUrl: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="iframe-container">
    <iframe :src="props.iframeUrl" frameborder="0"></iframe>
  </div>
</template>

<style scoped>
.iframe-container {
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  min-height: 350px;
}

.iframe-container iframe {
  height: 100%;
  display: block;
  border: none;
  width: 100%;
  min-height: 350px;
}
</style>
