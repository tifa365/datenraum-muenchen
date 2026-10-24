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
  <div class="d-flex flex-column bg-transparent container-fluid justify-content-between content">
    <h1 class="small-headline">My Profile</h1>
    <div class="panel-body inf-content">
      <div class="row">
        <div class="col-md-12">
          <strong class="table-header">User Information</strong><br>
          <div class="table-responsive">
          <table class="table table-user-information">
            <tbody>
              <tr>
                <td>
                  <strong>
                    <span class="glyphicon glyphicon-user text-primary"></span>
                    Name:
                  </strong>
                </td>
                <td class="text-primary">
                  {{ getUserName }}
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'DataProviderInterface-UserProfile',
  props: [],
  data() {
    return {
      values: {},
    };
  },
  computed: {
    ...mapGetters('auth', [
      'getUserName',
    ]),
  },
  methods: {},
  created() {},
};
</script>

<style scoped>
.inf-content{
  border:1px solid #DDDDDD;
  -webkit-border-radius:10px;
  -moz-border-radius:10px;
  border-radius:10px;
  box-shadow: 7px 7px 7px rgba(0, 0, 0, 0.3);
}

.table-header {
  padding: 0.75rem;
}
</style>
