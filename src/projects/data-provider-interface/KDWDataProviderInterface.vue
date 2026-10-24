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
import 'jquery';
import 'bootstrap';
import KButton from '../../projects/kdw/components/base/button/KButton.vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { DataProviderInterface, dpiSpecConfig } from '@piveau/piveau-hub-ui-modules/dataProviderInterface';
import { useDpiUtils } from '../kdw/utils/dpi';
import appConfig from '@config/appConfig';
const dcatapdeOdb = JSON.parse(JSON.stringify(dpiSpecConfig?.dcatapde))
// dcatapdeOdb.inputDefinition.distributions.accessService.$formkit = 'repeatableDataService'
const context = {
  specification: dcatapdeOdb,
  specificationName: 'dcatapde-kdw',
}

const route = useRoute()
const i18n = useI18n()

const { cleanupDpi } = useDpiUtils()

// Always cleanup DPI to ensure that it loads properly
// It's not pretty but it works
cleanupDpi()

// disable data uplaod if piveau hub store url is not specified
if (!appConfig?.piveauHubStoreUrl || appConfig?.piveauDisableDataUpload === 'true') {
  dcatapdeOdb.inputDefinition.distributions.accessURL = {
    identifier: 'accessUrl',
    $formkit: 'repeatable',
    name: 'dcat:accessURL',
    class: 'property inDistribution',
    children: [
      {
        identifier: 'accessUrl',
        validationType: 'url',
        $formkit: 'simpleAccessURLInput',
      }
    ]
  }
}

dcatapdeOdb.inputDefinition.datasets.keyword.children[0].children[0].identifier = 'language'
dcatapdeOdb.inputDefinition.distributions.licence = {
  // Disable manual input of license and only allow autocomplete through vocab
  $formkit: 'auto',
  name: 'dct:license',
  identifier: 'licence',
  // 👇 Intentionally set to 'licenses' instead of 'licence'. License submission and fetching will break otherwise for dcat-ap.de
  voc: 'licenses',
  class: 'property inDistribution',
}
dcatapdeOdb.inputDefinition.datasets.politicalGeocodingURI = {
  identifier: 'politicalGeocodingURI',
  $formkit: 'repeatable',
  name: 'dcatde:politicalGeocodingURI',
  vocabularyOnly: true,
  props: {
    vocabularyOnly: true,
  },
  children: [
    {
      $formkit: 'spatialinput',
      name: 'dcatde:politicalGeocodingURI',
      identifier: 'politicalGeocodingURI',
      vocabularyOnly: true,
    }]
}
dcatapdeOdb.inputDefinition.datasets.admsIdentifier.children[0].children[0].validation = 'admsIdentifierUriRequiredIfSibling|url'
dcatapdeOdb.inputDefinition.datasets.admsIdentifier.children[0].children[0].validationMessages = {
  admsIdentifierUriRequiredIfSibling: 'Eine URL ist erforderlich'
}
dcatapdeOdb.inputDefinition.datasets.admsIdentifier.children[0].children[0].validationVisibility = 'live'
dcatapdeOdb.inputDefinition.datasets.admsIdentifier.children[0].validationVisibility = 'live'

// dcatapdeOdb.inputDefinition.datasets.admsIdentifier.children[0].validation = '+admsIdentifierUriRequiredIfSibling'

// remove dct:subject
dcatapdeOdb.pageConent.datasets.Advised = (dcatapdeOdb.pageConent.datasets.Advised as string[]).filter((prop: string) => prop !== 'subject')

// process through the nested dcatapdeOdb object recursively
// recursion occurs whenever the object contains children, which contains an array of objects
function processObject(obj: any) {
  for (const [key, value] of Object.entries(obj)) {
    // if object contains name === '@language' and '$formkit' === 'select', then set property value to 'de'
    if (key === 'name' && value === '@language' && obj.$formkit === 'select') {
      obj.value = route.query.locale || i18n.locale
    }

    // translate date and datetime for modified and created
    // options: { date: 'Date', datetime: 'Datetime' },
    if (key === '$formkit' && value === 'select' && obj?.options?.date === 'Date' && obj?.options?.datetime === 'Datetime') {
      obj.options.date = 'Datum'
      obj.options.datetime = 'Datum & Uhrzeit'
    }

    if (typeof value === 'object') {
      processObject(value)
    }
  }
}

processObject(dcatapdeOdb)
</script>

<template>
  <div class="flex flex-col justify-center w-full">
    <div class="max-w-[70.5rem] w-full p-8">
      <RouterLink to="/app/data-catalog">
        <KButton severity="contrast" icon="icon-[ph--arrow-left]" :label="$t('dpi.back-to-datacatalog') ">
        </KButton>
      </RouterLink>
    </div>
    <div class="grid place-content-center">
      <div class="max-w-[70.5rem] w-[70.5rem] d-flex flex-column bg-transparent justify-center dpi position-relative">
        <DataProviderInterface id="kdw-data-provider-interface" :dpi-context="context" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "bootstrap/scss/functions"; // Required
@import "bootstrap/scss/variables"; // Required
@import "bootstrap/scss/mixins"; // Required
@import "../../../node_modules/@piveau/piveau-hub-ui-modules/dist/piveau-hub-ui-modules.css";

@import "../../../node_modules/material-design-icons/iconfont/material-icons.css";


#kdw-data-provider-interface {
  @import './style/main.scss';

  .border-bottom-lightgray {
    border-bottom: 1px solid lightgray;
  }
  .stickyStepper {
    position: sticky;
    top: 0;
    background: var(--color-bg-white);
    z-index: 999;
  }

  .stickyStepper .SSfirstRow {
    margin: 1vh 0;
    display: flex;
    align-items: center;
  }

  .stickyStepper .stickyNav {
    border-left: 1px solid black;
    margin-left: 1vh;
    padding-left: 1vh;
  }

  #stepper {
    width: 100% !important;
  }

  #input {
    padding: 10px;
  }

  .small-headline {
    font-size: 1.5rem;
    min-width: max-content;
  }

  .property {
    margin: 20px;
    background-color: var(--color-bg-white);
    border: solid 0.5px rgb(225, 225, 225);
    margin-top: 30px;
  }

  .infoBox .material-icons {
    font-size: 20px;
    vertical-align: text-bottom;
    margin-right: 5px;
    margin-bottom: 1px;
  }

  .infoBox {
    width: 100%;
    height: 30%;
    background-color: #f7f7f7;
    padding: 5%;
    border-radius: 0.25rem;
    margin-top: 20px;

    .input_subpage_nav {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 15px;
    }
  }

  .besides {
    .formkit-input-group-repeatable {
      display: flex;
      flex-direction: row;
      background-color: transparent;
      padding: 0px;
    }
  }

  .main {
    width: 75%;
    margin: 0 5px 0 5px;
  }

  .sub {
    width: 20%;
    margin: 0 5px 0 5px;
  }

  #subStepperBox {
    position: sticky;
    top: 154px;
    z-index: 10;
    width: 100%;
    padding: 0 10%;

    .step-progress__bar {
      border-top: none !important;
    }

    .step-progress__step--active {
      .step-progress__step-label {
        background-color: lightsteelblue !important;
      }

    }
  }

  .step-progress__step span{

      color:white !important;

  }
  // Stepper Customizing -------------

  // #stepper,
  // #subStepper {
  //   .step-progress__step {
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     height: 70%;
  //     width: 20%;
  //     display: flex;
  //     align-items: center;
  //     z-index: 1;


  //     span {
  //       color: grey;
  //       font-size: 18px;
  //       display: none;
  //     }

  //     div {
  //       padding: 1rem;
  //       height: 100%;
  //       display: flex;
  //       align-items: center;
  //       color: white;
  //       font-weight: 300;

  //     }

  //     .step-progress__step-label {

  //       background: lightgrey;
  //       background-size: 400% 400%;
  //       background-position: 100% 0%;
  //       transition: all 300ms ease-in-out;
  //       border-right: 1px white solid;
  //       font-size: 14px;
  //       display: flex;
  //       align-items: center;
  //       justify-content: center;


  //     }


  //     .step-progress__step-label:hover {
  //       background-position: 65% 0%;
  //       color: black;

  //     }

  //   }

  //   .step-progress__step--active {

  //     z-index: 7 !important;


  //     span {
  //       color: black;
  //     }

  //     div {
  //       background: white;
  //     }

  //     .step-progress__step-label {
  //       background: rgb(236, 236, 236);
  //       background-position: 50% 0%;
  //       box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) !important;
  //       transform: scale(1.1);
  //       z-index: 8;
  //       font-size: 16px;
  //     }

  //   }

  //   .step-progress__step--valid {
  //     div {
  //       color: white;

  //     }

  //     .step-progress__step-label {
  //       background: rgba(0, 235, 0, 0.2);
  //       color: lightslategrey;


  //     }

  //     .step-progress__step-label:hover {
  //       color: black;
  //     }
  //   }

  //   .step-progress__step--active .step-progress__step-label {
  //     color: rgb(31, 31, 31);
  //   }

  //   .step-progress__wrapper-after {
  //     display: none;
  //   }

  //   .step-progress__step-icon {
  //     display: none !important;
  //   }

  //   .step-progress__bar {
  //     margin: 0;
  //     height: 5rem;
  //     border-top: 1px solid lightslategray;

  //   }

  //   .step-progress__step-label {
  //     position: unset;
  //     transform: unset;
  //     flex-grow: 1;
  //   }

  //   .step-progress__step {}

  //   .step-progress__wrapper-before {
  //     display: none !important;
  //   }

  //   #stepper .step-progress__step::after {
  //     display: none !important;
  //   }
  // }
  #stepper .step-progress__step{
    border: solid white 20px;
  }
  #stepper .step-progress__step-icon, #subStepper .step-progress__step-icon {
      font-size: 25px;
  }
  .step-progress__step-label{
    cursor: pointer;
  }
  // Input Form Margins & Borders ----

  .formkit-input[data-classification=group] [data-is-repeatable] {
    border: none;
    padding: 1em 1em 1em 0em;
  }

  .formkit-input[data-classification=group] [data-is-repeatable] .formkit-input-group-repeatable {
    border-bottom: none;
  }

  .formkit-input-element--checkbox {
    margin-right: 5px;
  }

  .formkit-input-wrapper {
    font-family: "Ubuntu";
  }

  .formkit-input[data-classification=button] button[data-ghost] {
    font-weight: 400;
  }

  .formkit-input-error {
    color: #e13737 !important;
    font-weight: 400 !important;
  }

  // General Formkit Styling ----

  .formkit {
    &-input {
      .formkit {
        &-input {
          &-element {
            max-width: 100%;
          }

          &-error {
            font-weight: bold;
          }
        }
      }
    }

    .formkit-input-group-add-more {
      display: flex;
      justify-content: flex-end;

      button {
        border: black;
      }
    }

    .formkit-input {
      &[data-classification="text"] .formkit-input-wrapper {
        display: flex;
        flex-direction: column;
      }

      &[data-classification="select"] .formkit-input-wrapper {
        display: flex;
        flex-direction: column;
      }
    }

    .formkit-input[data-classification="button"] {
      button {
        &[data-ghost] {
          color: white;
          background-color: #001d85;
          border-color: #001d85;
          border-radius: 1.875rem;

          &:hover {
            background-color: #196fd2;
            border-color: #196fd2;
          }
        }
      }
    }
  }

  .formkit-input.besides {
    border-bottom: 1px solid lightgrey !important;
  }

  .formkit-input-label {
    font-weight: 500 !important;
  }

  .formkit-input-element {

    &--textarea {
      width: 100%;
    }
  }

  .formkit-input-element--group {
    display: block !important;
  }

  .formkit-input.besides>.formkit-input-wrapper>.formkit-input-label {


    text-decoration: underline !important;
  }

  // #stepper,
  // #subStepper {


  //   .step-progress__step::after {
  //     display: none;
  //   }

  //   .step-progress__step-label {
  //     cursor: pointer;
  //   }
  // }
}

</style>
