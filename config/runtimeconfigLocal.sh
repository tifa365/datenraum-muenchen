#!/bin/bash
# This file is part of Civora UI.
#
# Copyright (C) 2025 DKSR GmbH.
#
# Civora UI is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, version 3.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.


source ./default.env

function join_by { local IFS="$1"; shift; echo "$*"; }

echo I am $(whoami)

# Find vue env vars
vars=$(env | grep VITE_ | awk -F = '{print "$"$1}')
vars=$(join_by ',' $vars)
echo "Found variables $vars"

for file in ../dist/assets/index-*.js;
do
  echo "Processing $file ...";

  # Use the existing JS file as template
  if [ ! -f $file.tmpl.js ]; then
    cp $file $file.tmpl.js
  fi
  envsubst "$vars" < $file.tmpl.js > $file
  rm $file.tmpl.js
done
