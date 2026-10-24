#!/bin/ash
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

source /default.env

function join_by { local IFS="$1"; shift; echo "$*"; }

echo I am $(whoami)

# Find vue env vars
vars=$(env | grep VITE_ | awk -F = '{print "$"$1}')
vars=$(join_by ',' $vars)
echo "Found variables $vars"

# workaround fix for safari not allowing dynamic favicons
cp /usr/share/nginx/html/config/$VITE_CUSTOMER_NAME/assets/favicon.png /usr/share/nginx/html/favicon.png

for file in /usr/share/nginx/html/assets/index-*.js;
do
  echo "Processing $file ...";

  # Use the existing JS file as template
  if [ ! -f $file.tmpl.js ]; then
    cp $file $file.tmpl.js
  fi
  envsubst "$vars" < $file.tmpl.js > $file
  rm $file.tmpl.js
done

if [ -z "$VITE_APP_OG_TITLE" ]; then
  echo "VITE_APP_OG_TITLE is not set or empty, removing og:title meta tag from index.html ..."
  sed -i '/<meta[^>]*property="og:title"[^>]*>/d' /usr/share/nginx/html/index.html
fi

if [ -z "$VITE_APP_OG_DESCRIPTION" ]; then
  echo "VITE_APP_OG_DESCRIPTION is not set or empty, removing og:description meta tag from index.html ..."
  sed -i '/<meta[^>]*property="og:description"[^>]*>/d' /usr/share/nginx/html/index.html
fi

if [ -z "$VITE_APP_OG_IMAGE" ]; then
  echo "VITE_APP_OG_IMAGE is not set or empty, removing og:image meta tag from index.html ..."
  sed -i '/<meta[^>]*property="og:image"[^>]*>/d' /usr/share/nginx/html/index.html
fi

echo "Processing OpenGraph and index.html ..."
cp /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.tmpl
envsubst "$vars" < /usr/share/nginx/html/index.html.tmpl > /usr/share/nginx/html/index.html
rm /usr/share/nginx/html/index.html.tmpl

echo "Starting nginx"
nginx -g 'daemon off;'
