/*
 * This file is part of Civora UI.
 *
 * Copyright (C) 2025 DKSR GmbH.
 *
 * Civora UI is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { injectionKey } from "@config/userConfigShimPlugin";
import { inject } from "vue";

/**
 * Utility function for retrieving the runtime configuration object.
 */
export function useRuntimeEnv() {
  const env = inject(injectionKey);

  if (!env) {
    throw new Error("No runtime environment found. Did you forget to install the runtime configuration service?");
  }

  return env;
}