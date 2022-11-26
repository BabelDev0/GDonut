<template>
  <q-layout view="hHh Lpr fFf">
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="absolute-center text-weight-medium">
          Calculator
        </q-toolbar-title>
        <q-space />
        <!-- FILE PICKER -->
        <q-file
          class="standout-color-white"
          outlined
          v-model="filePicker"
          label-color="white"
          item-aligned
          label="Select Image"
          color="white"
          style="min-width: 20em"
          maxlength="1"
        >
          <template v-slot:prepend>
            <q-icon name="cloud_upload" color="white" size="lg" />
          </template>
        </q-file>
        <!-- RELOAD AND INFO BUTTON -->
        <div class="row">
          <q-btn flat round size="lg" color="white" icon="info" @click="" />
          <q-btn
            flat
            round
            size="lg"
            color="white"
            icon="refresh"
            @click="reloadWindow()"
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :breakpoint="700"
      elevated
      behavior="desktop"
      :width="drawerSize"
    >
      <!-- DRAWER CONTENT -->

      <!-- GROUP -->
      <div class="full-width row justify-start q-py-xs">
        <!-- SELECT GROUP -->
        <q-fab
          square
          flat
          v-model="group"
          :label="groupSelected.label == '' ? 'Group' : groupSelected.label"
          vertical-actions-align="left"
          color="primary"
          icon="keyboard_arrow_down"
          direction="down"
        >
          <q-fab-action
            v-for="item in groups"
            square
            color="primary"
            @click="groupSelected = item"
            :label="item.label"
            :key="item.label"
          />
        </q-fab>
        <div v-if="groupSelected.label !== ''">
          <q-btn
            flat
            round
            size="md"
            color="primary"
            icon="info"
            class="q-my-sm"
            @click="groupDialog = true"
          >
            <q-tooltip
              style="background-color: #bb2e29"
              class="text-body2"
              anchor="center right"
              self="center left"
            >
              group usage info
            </q-tooltip>
          </q-btn>
        </div>
      </div>
      <!-- POLY -->
      <div class="full-width row justify-center">
        <math-field
          id="formula"
          class="full-width"
          style="
            font-size: 22px;
            padding: 5px;
            border: 1px solid rgba(0, 0, 0, 0.3);
            outline-color: #bb2e29;
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
          "
          keypress-sound="none"
          plonk-sound="none"
        >
        </math-field>
      </div>
      <!-- UNKNOWNS -->
      <div class="full-width row justify-center q-pt-md">
        <q-input
          v-for="unknown in groupSelected.unknowns"
          square
          class="w-auto q-mx-xs q-my-xs"
          outlined
          v-model="unknown.value"
          :key="unknown.label"
        >
          <template v-slot:prepend>
            <q-chip color="primary" text-color="white" square>
              {{ unknown.label }}
            </q-chip>
          </template>
        </q-input>
      </div>
      <!-- PERMUTANTS -->
      <div class="full-width row justify-center q-pt-md">
        <q-input
          v-for="permutant in groupSelected.permutants"
          square
          class="full-width q-mb-sm"
          outlined
          v-model="permutant.description"
          :key="permutant.label"
          :readonly="true"
        >
          <template v-slot:prepend>
            <q-chip color="primary" text-color="white" icon="calculate">
              {{ permutant.label }}
            </q-chip>
          </template>
        </q-input>
      </div>
      <!-- NORMALIZE -->
      <div
        v-if="groupSelected.label !== ''"
        class="full-width row justify-center q-pt-md"
      >
        <q-input
          square
          class="w-auto q-mx-xs q-my-xs"
          outlined
          v-model="normalizeBy"
        >
          <template v-slot:prepend>
            <q-chip color="primary" text-color="white" square>
              Normalize by
            </q-chip>
          </template>
        </q-input>
        <div class="col-1">
          <div class="q-mt-md q-ml-sm">
            <q-btn
              round
              size="sm"
              color="primary"
              icon="restore"
              @click="showGeneo()"
            >
              <q-tooltip
                style="background-color: #bb2e29"
                class="text-body2"
                anchor="center right"
                self="center left"
              >
                restore normalaize constant
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- MAIN -->
    <q-page-container>
      <!-- GENEO CANVAS -->
      <div class="full-width row justify-center q-mt-sm">
        <div class="column justify-start q-mt-md">
          <div class="">
            <div class="row">
              <!-- CANVAS COMPONENT -->
              <div class="col-11">
                <canvas
                  class="q-mb-xs"
                  id="canvasGeneo"
                  :width="canvasSize"
                  :height="canvasSize"
                  style="border: 1px solid #bb2e29"
                >
                  Your browser does not support the HTML5 canvas tag.
                </canvas>
              </div>
              <!-- PRINTER BUTTON -->
              <div class="col-1">
                <div class="q-my-sm q-ml-sm">
                  <q-btn
                    round
                    size="sm"
                    color="primary"
                    icon="print"
                    @click="download_image()"
                  >
                    <q-tooltip
                      style="background-color: #bb2e29"
                      class="text-body2"
                      anchor="center right"
                      self="center left"
                    >
                      print image
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
            <!-- CANVAS SIZE LABEL -->
            <div class="row justify-start">
              <small>{{ canvasSize }} X {{ canvasSize }} </small>
            </div>
          </div>
        </div>
      </div>
      <!-- TEST CANVAS -->
      <div class="full-width row justify-center q-mt-sm">
        <div class="">
          <div class="row">
            <!-- CANVAS COMPONENT -->
            <div class="col-11">
              <canvas
                class="q-mt-md q-mb-xs"
                id="canvasSample"
                :width="canvasSize"
                :height="canvasSize"
                style="border: 1px solid #bb2e29"
              >
                Your browser does not support the HTML5 canvas tag.
              </canvas>
            </div>
            <!-- ACTIONS BUTTONS -->
            <div class="col-1 q-mt-md">
              <div class="q-my-sm q-ml-sm">
                <q-btn
                  round
                  size="sm"
                  color="primary"
                  icon="rotate_90_degrees_cw"
                  @click="initSampleImage()"
                >
                  <q-tooltip
                    style="background-color: #bb2e29"
                    class="text-body2"
                    anchor="center right"
                    self="center left"
                  >
                    rotate image
                  </q-tooltip>
                </q-btn>
              </div>
              <div class="q-my-sm q-ml-sm">
                <q-btn
                  round
                  size="sm"
                  color="primary"
                  icon="flip"
                  @click="initSampleImage()"
                >
                  <q-tooltip
                    style="background-color: #bb2e29"
                    class="text-body2"
                    anchor="center right"
                    self="center left"
                  >
                    flips the image horizontally
                  </q-tooltip>
                </q-btn>
              </div>
              <div class="q-my-sm q-ml-sm">
                <q-btn
                  round
                  size="sm"
                  color="primary"
                  icon="flip"
                  class="rotate-90"
                  @click="initSampleImage()"
                >
                  <q-tooltip
                    style="background-color: #bb2e29"
                    class="text-body2"
                    anchor="center right"
                    self="center left"
                  >
                    flips the image vertically
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
          <!-- CANVAS SIZE LABEL -->
          <div class="row justify-start">
            <small>{{ canvasSize }} X {{ canvasSize }} </small>
          </div>
        </div>
      </div>
    </q-page-container>

    <q-dialog v-model="groupDialog">
      <q-card>
        <q-toolbar>
          <q-toolbar-title
            ><span class="text-weight-bold">Group : </span>
            {{ groupSelected.label }}</q-toolbar-title
          >

          <q-btn
            flat
            round
            dense
            icon="close"
            v-close-popup
            @click="groupStep = 1"
          />
        </q-toolbar>

        <div>
          <q-stepper v-model="groupStep" ref="stepper" color="primary" animated>
            <q-step
              :name="1"
              title="Group Info"
              icon="settings"
              :done="groupStep > 1"
            >
              <q-card-section>
                <div class="full-width text-center">
                  <h6 class="q-mt-xs q-mb-lg">
                    {{ groupSelected.description }}
                  </h6>
                </div>
                <div v-if="groupSelected.unknowns.length > 0">
                  <p>
                    <span class="text-weight-bold">Unknowns : </span>assigns the
                    variables to be used by permutants
                  </p>
                  <div class="full-width row justify-center">
                    <q-input
                      v-for="unknown in groupSelected.unknowns"
                      square
                      class="w-auto q-mx-xs q-mb-sm"
                      outlined
                      v-model="unknown.value"
                      :key="unknown.label"
                      readonly
                    >
                      <template v-slot:prepend>
                        <q-chip color="primary" text-color="white" square>
                          {{ unknown.label }}
                        </q-chip>
                      </template>
                    </q-input>
                  </div>
                </div>
                <div class="q-mt-md">
                  <p>
                    <span class="text-weight-bold">Permutants : </span>list of
                    permutants belonging to the group
                  </p>
                  <div class="full-width row justify-center">
                    <q-input
                      v-for="permutant in groupSelected.permutants"
                      square
                      class="full-width q-mb-sm"
                      outlined
                      v-model="permutant.description"
                      autogrow
                      :key="permutant.label"
                      :readonly="true"
                    >
                      <template v-slot:prepend>
                        <q-chip
                          color="primary"
                          text-color="white"
                          icon="calculate"
                        >
                          {{ permutant.label }}
                        </q-chip>
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>
            </q-step>

            <q-step
              :name="2"
              title="Write polynomial"
              icon="create_new_folder"
              :done="groupStep > 2"
            >
              <div class="full-width row justify-center q-pa-lg">
                <h6 class="q-mt-xs q-mb-md text-center">
                  Write your polynomial in the input box
                </h6>
                <math-field
                  id="formulaExample"
                  class="full-width"
                  style="
                    font-size: 22px;
                    padding: 5px;
                    border: 1px solid rgba(0, 0, 0, 0.3);
                    outline-color: #bb2e29;
                    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
                  "
                  readonly="true"
                  keypress-sound="none"
                  plonk-sound="none"
                >
                  {{ polynomialTest }}
                </math-field>
                <ul>
                  <li class="q-mt-sm">
                    <span class="text-weight-bold">
                      <span style="color: #bb2e29">Use</span>
                      \sigma_n as the n-th elementary symmetric polynomial
                    </span>
                  </li>
                  <li class="q-mt-sm">
                    <span class="text-weight-bold">
                      <span style="color: #bb2e29">Use</span>
                      a_n as the n-th permutant cognugate with the data function
                    </span>
                  </li>
                  <li class="q-mt-sm">
                    <span class="text-weight-bold">
                      <span style="color: #bb2e29">Note</span>
                      not to omit any operand such as the * in multiplication
                      and if you want to perform division multiply by the
                      reciprocal
                    </span>
                  </li>
                  <li class="q-mt-sm">
                    <span class="text-weight-bold">
                      <span style="color: #bb2e29">Note</span>
                      if you want to perform division multiply by the reciprocal
                    </span>
                  </li>
                </ul>
                <p class="text-center text-weight-bold" style="color: #bb2e29">
                  if the polynomial is formed incorrectly the geneo canvas will
                  turn white
                </p>
              </div>
            </q-step>

            <q-step
              :name="3"
              title="Normalize"
              icon="create_new_folder"
              :done="groupStep > 2"
            >
              <div class="full-width row justify-center q-pa-lg">
                <div>
                  <h6 class="q-mt-xs q-mb-xs text-center">Normalize</h6>

                  <div class="full-width row justify-center q-mt-md">
                    <q-input
                      square
                      class="w-auto q-mx-xs q-my-xs"
                      outlined
                      v-model="normalizeBy"
                      readonly
                    >
                      <template v-slot:prepend>
                        <q-chip color="primary" text-color="white" square>
                          Normalize by
                        </q-chip>
                      </template>
                    </q-input>
                    <div class="col-1">
                      <div class="q-mt-md q-ml-sm">
                        <q-btn
                          round
                          size="sm"
                          color="primary"
                          icon="restore"
                          @click=""
                        />
                      </div>
                    </div>
                  </div>

                  <p class="text-center q-mt-md">
                    in order to show the geneo we apply a normalisation
                    operation, it is possible to vary this value to obtain
                    different views. The button on the right reapplies the
                    default normalisation constant
                  </p>
                </div>
              </div>
            </q-step>

            <template v-slot:navigation>
              <q-stepper-navigation>
                <q-btn
                  v-if="groupStep < 3"
                  @click="groupStep++"
                  color="primary"
                  :label="groupStep === 4 ? 'Finish' : 'Continue'"
                />
                <q-btn
                  v-if="groupStep > 1"
                  flat
                  color="primary"
                  @click="groupStep--"
                  label="Back"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </template>
          </q-stepper>
        </div>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { Matrix } from "ml-matrix";
import { onMounted, ref, watch } from "vue";
import { CanvasUtils } from "../utils/CanvasUtils";
import { PolynomialUtils } from "../utils/PolynomialUtils";
import { MathfieldElement } from "mathlive";
import { Data } from "../interfaces/data";
const mfe = new MathfieldElement();

// selectable groups
const groups: Array<Group> = Data.groups;
// size of all canvases (they are all square)
const canvasSize = 350;

// canvases to paint on
var canvasGeneo: any;
var canvasSample: any;

//sample image from wich to extract the sample matrix
var sampleImg = new Image();

// matrixes to work with
var sampleImgMatrix: Matrix;
var geneoMatrix: Matrix | null;

// use to debounce the geneo matrix calculation
var timerCallShowGeneo = 0;

// polynomial to be evaluated
const poly = ref<string>("");

// drawer settings
const drawerSize = 500;
const leftDrawerOpen = true;

// class use to evaluate the polynomial and generate the geneo
var polyUtils: PolynomialUtils;

// variable used to detect whether the showGeneo method has just been executed
var justShowGeneo = true;

// variable used to trigger the picker of the sample image
const filePicker = ref(null);

// variable used to normalize the geneo by different values from the default
const normalizeBy = ref(0);

// group selected by the user
const groupSelected = ref<Group>({
  label: "",
  description: "",
  permutants: [],
  unknowns: [],
});

const polynomialTest = ref<string>("");
const stateWrite = ref(false);

const group = ref(false);
const groupDialog = ref(false);
const groupStep = ref(1);

const download_image = async () => {};

const reloadWindow = () => {
  window.location.reload();
};

/**
 * method to calculate the geneo
 * normalise it and display it on the canvas
 */
const showGeneo = () => {
  if (sampleImgMatrix) {
    if (groupSelected.value.label !== "") {
      if (poly.value != "") {
        try {
          polyUtils = new PolynomialUtils(
            sampleImgMatrix,
            sampleImg,
            canvasSize,
            groupSelected.value.permutants,
            groupSelected.value.unknowns
          );

          // matrix with the geneo also with the constant
          geneoMatrix = polyUtils.evaluate(poly.value);
          console.log("Geneo", geneoMatrix);

          if (geneoMatrix) {
            // matrix with the geneo normalized by (default == -1)
            var geneoMatrixNormalized = polyUtils.normalizeGeneo(
              geneoMatrix,
              -1
            );
            console.log("Normalized", geneoMatrixNormalized);
            justShowGeneo = true;
            normalizeBy.value = polyUtils.constToNormalize;
            CanvasUtils.drawMatrix(geneoMatrixNormalized, canvasGeneo);
          }
        } catch (e) {
          CanvasUtils.clearCanvas(canvasGeneo);
          console.log(e);
          return;
        }
      } else {
        CanvasUtils.clearCanvas(canvasGeneo);
      }
    } else {
      console.log("Group not selected");
    }
  } else {
    console.log("Sample image not exist");
  }
};

/**
 * I acquire the image data and transform it into a matrix
 * then call showGeneo to show the geneo in the event of an
 * image change during previous processing
 */
const initSampleImage = () => {
  if (sampleImg) {
    var ctx = canvasSample.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      CanvasUtils.clearCanvas(canvasSample);
      // draws the image in the canvas by applying a resize
      ctx.drawImage(sampleImg, 0, 0, canvasSize, canvasSize);

      var sampleImgData = ctx.getImageData(0, 0, canvasSize, canvasSize);

      sampleImgMatrix = CanvasUtils.canvasToMatrix(
        sampleImgData.data,
        canvasSize
      );

      showGeneo();
    } else {
      console.log("ctx dosen't exist");
    }
  } else {
    console.log("image dosen't exist");
  }
};

/**
 * does the bind between the variables and the canvas
 * and between the polynomial var and the math field
 */
onMounted(() => {
  canvasSample = document.getElementById("canvasSample");
  canvasGeneo = document.getElementById("canvasGeneo");

  // binds the contents of the math field with the polynomial variable
  if (document.getElementById("formula")) {
    document.getElementById("formula")!.addEventListener("input", (ev: any) => {
      poly.value = ev.target.value;
    });
  }
});

const writeTestPoly = () => {
  const example = "-\\sigma_1(a_1,a_2)+3\\cdot\\sigma_2(a_1,a_2)^2";
  var i = 0;
  polynomialTest.value = "";
  var interval = setInterval(() => {
    if (!stateWrite.value) {
      clearInterval(interval);
    }
    polynomialTest.value += example[i];
    i++;

    if (i >= example.length) {
      clearInterval(interval);
      setTimeout(() => {
        writeTestPoly();
      }, 2000);
    }
  }, 200);
};

watch(groupStep, () => {
  if (groupStep.value === 2) {
    stateWrite.value = true;
    writeTestPoly();
  } else {
    stateWrite.value = false;
  }
});

/**
 * watch at the file picker if you select an image it
 * loads it as a sample image to do the processing on
 */
watch(
  filePicker,
  (newVal) => {
    if (newVal) {
      var reader = new FileReader();
      reader.onload = () => {
        sampleImg.src = reader.result as string;
        // when the image is loaded it calls the initSampleImage function
        sampleImg.onload = () => initSampleImage();
      };
      reader.readAsDataURL(newVal);
    }
  },
  { immediate: true }
);

/**
 * watch at the normalizeBy variable to normalize de geneo and show it
 * if the normalizeBy is changed,
 * the method prevents to run if the showGeneo method has just been executed
 */
watch(normalizeBy, () => {
  if (!justShowGeneo) {
    if (geneoMatrix) {
      var geneoMatrixNormalized = polyUtils.normalizeGeneo(
        geneoMatrix,
        +normalizeBy.value
      );

      CanvasUtils.drawMatrix(geneoMatrixNormalized, canvasGeneo);
    }
  } else {
    justShowGeneo = false;
  }
});

/**
 * watch at the polynomial variable and call the showGeneo method if the polynomial is changed
 * delay the execution of the function showGeneo to avoid the execution
 * of the function when the user is typing
 */
watch(
  poly,
  () => {
    //
    if (timerCallShowGeneo) {
      clearTimeout(timerCallShowGeneo);
    }
    timerCallShowGeneo = setTimeout(() => {
      console.log("show geneo");
      showGeneo();
    }, 200);
  },
  { deep: true }
);

/**
 * watch at the groupSelected variable and call the showGeneo method if the group is changed
 * this method is separated from the watch of the polynomial variable only due to the timer
 */
watch(
  groupSelected,
  () => {
    console.log("show geneo");
    showGeneo();
  },
  { deep: true }
);
</script>

<style scoped>
@import "mathlive/dist/mathlive-fonts.css";
</style>
