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

const {addDynamicIconSelectors} = require('@iconify/tailwind')
const plugin = require('tailwindcss/plugin');

// We bundle a small icon set (<500 icons) to not drive up bundle size.
// In addition, we can use emojis, see DashboardWidget.vue.
const bundledDashboardIconSet = require('@iconify/json/json/mdi-light.json');
const dashboardIconPlugin = function ({addUtilities}) {
    // This plugin adds custom CSS using the TailwindCSS utility API.
    // It generates a utility class for each icon in the bundled icon set.
    // See https://icon-sets.iconify.design/mdi-light/ for a list of all icons.
    const newUtilities = Object.keys(bundledDashboardIconSet.icons).reduce((acc, icon) => {
        const svgBody = bundledDashboardIconSet.icons[icon].body;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${svgBody}</svg>`;
        const encodedSvg = encodeURIComponent(svg)
            .replace(/'/g, '%27')
            .replace(/"/g, '%22');
        // The class is accessible like "icon-{iconname}".
        acc[`.icon-${icon}`] = {
            backgroundImage: `url("data:image/svg+xml,${encodedSvg}") !important`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            display: 'inline-block',
            width: '1em',
            height: '1em',
        };

        return acc;
    }, {});

    addUtilities(newUtilities);
};

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'false',
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx,html}',
    ],
    safelist: [
        // Keep all icons for dashboards since these are dynamically loaded.
        // If removed from here,the icons will not be included in the final CSS due to tree-shaking.
        ...Object.keys(bundledDashboardIconSet.icons).map((iconName) => `icon-${iconName}`),
    ],
    theme: {
        fontFamily: {
            sans: ['"Inter Variable"', 'sans-serif'],
        },
        extend: {
            colors: {
                'primary-50': 'rgb(var(--blue-100))',
                'primary-100': 'rgb(var(--blue-200))',
                'primary-200': 'rgb(var(--blue-200))',
                'primary-300': 'rgb(var(--blue-300))',
                'primary-400': 'rgb(var(--blue-400))',
                'primary-500': 'rgb(var(--blue-500))',
                'primary-600': 'rgb(var(--blue-600))',
                'primary-700': 'rgb(var(--blue-700))',
                'primary-800': 'rgb(var(--blue-800))',
                'primary-900': 'rgb(var(--blue-900))',
                'primary-950': 'rgb(var(--blue-1000))',

                // Map surface to 'light' color palette from KDW
                // Because surface is more finely grained than light,
                // try to map the surface colors to the nearest light color
                'surface-0': 'rgb(var(--light-100))',
                'surface-50': 'rgb(var(--light-200))',
                'surface-100': 'rgb(var(--light-200))',
                'surface-200': 'rgb(var(--light-300))',
                'surface-300': 'rgb(var(--light-400))',
                'surface-400': 'rgb(var(--light-500))',
                'surface-500': 'rgb(var(--light-700))',
                'surface-600': 'rgb(var(--light-700))',
                'surface-700': 'rgb(var(--light-800))',
                'surface-800': 'rgb(var(--light-900))',
                'surface-900': 'rgb(var(--light-900))',
                'surface-950': 'rgb(var(--light-1000))',

                'content': 'rgb(var(--light-1000))',
                'content-lighter': 'rgb(var(--light-900))',
                'content-icon': 'rgb(var(--light-700))',

                'neutral': 'rgb(var(--light-1000))',
                'neutral-lighter': 'rgb(var(--light-900))',
                'neutral-icon': 'rgb(var(--light-700))',

                'bg-lighter': 'rgb(var(--light-0))',
                'bg-divider': 'rgb(var(--light-300))',
                'bg-darker': 'var(--color-bg-darker)',
                'bg-base': 'var(--color-bg-darker)',
                'bg-hover': 'var(--color-bg-hover)',

                'primary': 'rgb(var(--btn-pressed))',
                'secondary': '#B6EAFA',
                'tertiary': '#ffffff',

                'btn-hover': 'rgb(var(--btn-hover))',
                'btn-regular': 'rgb(var(--btn-regular))',
                'btn-pressed': 'rgb(var(--btn-pressed))',

            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        plugin(dashboardIconPlugin),
        addDynamicIconSelectors({
            // 1.5rem = 24px = 2xl
            scale: 1.5,
        }),
    ],
}
