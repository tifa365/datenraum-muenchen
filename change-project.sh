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

# Check if exactly one argument is passed
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <project name>"
  exit 1
fi

# Extract customer name (without .js)
CUSTOMER_NAME="${1%.js}"

# Paths
CONFIG_FOLDER="./config"
CUSTOMER_FOLDER="${CONFIG_FOLDER}/${CUSTOMER_NAME}"
CONFIG_FILE="${CONFIG_FOLDER}/config.dev.js"
PROJECT_FILE="${CUSTOMER_FOLDER}/config.js"

# Check if the project file exists
if [ ! -f "${PROJECT_FILE}" ]; then
  echo "Error: ${PROJECT_FILE} does not exist."
  exit 1
fi

# Overwrite the config.dev.js with the content of the project file
cp "${PROJECT_FILE}" "${CONFIG_FILE}"

echo "Config file ${CONFIG_FILE} has been updated with ${PROJECT_FILE}."
