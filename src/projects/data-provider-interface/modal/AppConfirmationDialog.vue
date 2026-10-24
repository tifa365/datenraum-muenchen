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
  <!-- Modals -->
  <div id="modal" class="modal fade modalWrapper" tabindex="-1" role="dialog" aria-labelledby="confirmationDialogLabel"
    data-backdrop="false" data-cy="create-doi-modal">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title" id="confirmationDialogLabel">
            {{ head }}
          </h2>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <slot>
            Are you sure? This process can not be reverted.
          </slot>
        </div>
        <!-- Export options -->
        <!-- Currently unused but might be useful in the future -->
        <div class="modal-footer">
          <!-- <div class="alert alert-danger mr-auto" v-if="modal.error">
            {{ modal.error.message || "An unexpected network error occured." }}
          </div> -->
          <button class="btn btn-secondary" @click="$emit('confirm')" :disabled="loading">
            <span v-show="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            {{ resolvedConfirm }}
          </button>
          <button class="btn btn-secondary" data-dismiss="modal" @click="handleHeader" :disabled="loading">Schließen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import $ from 'jquery';

export default defineComponent({
  name: 'ConfirmationDialog',
  inheritAttrs: false,
  props: {
    head: {
      type: String,
      default: 'Hinweis'
    },
    confirm: {
      type: String,
      default: 'Confirm'
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods:{
    handleHeader(){
      $('#navbar-toggle').css("z-index", "99")
    }
  },
  computed: {
    resolvedConfirm() {
      return this.confirm === 'Confirm' ? this.$t('message.dataupload.modal.confirmModal') : this.confirm
    }
  }
});
</script>

<style>
/* If the display:block is active, the modal will appear in the bavaria hub-ui and makes it unusable. But it's actually not needed here.*/
.modalWrapper {
  backdrop-filter: brightness(0.5);
  /* display: block; */
  align-items: center;
  z-index: 100;
}
</style>