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
        <input
          type="file"
          id="filePicker"
          @change="onFileChange"
          style="display: none"
        />
        <!-- RELOAD AND INFO BUTTON -->
        <div class="row">
          <q-btn
            flat
            round
            size="lg"
            color="white"
            icon="cloud_upload"
            @click="filePicker.click()"
            :disable="loading"
          />
          <q-btn
            flat
            round
            size="lg"
            color="white"
            icon="info"
            @click="showGroupInfoDialog()"
          />
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
          :label="groupSelected.label == '' ? 'Group' : groupSelected.label"
          vertical-actions-align="left"
          color="primary"
          icon="keyboard_arrow_down"
          direction="down"
          :disable="loading"
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
            @click="showGroupInfoDialog()"
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
          :disabled="loading"
        >
        </math-field>
      </div>
      <!-- UNKNOWNS -->
      <div class="full-width row justify-center q-pt-md">
        <q-input
          v-for="unknown in groupSelected.unknowns"
          square
          class="w-auto q-mx-xs q-my-xs col-5"
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
          class="w-auto q-mx-xs q-my-xs col-6"
          outlined
          v-model="normalizeBy"
          :disable="loading"
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
              :disable="loading"
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
      <!-- MADE BY -->
      <div
        class="row justify-center full-width absolute-bottom q-mb-sm"
        style="color: #bb2e29"
      >
        <span>
          made by <a href="https://github.com/BabelDev0">Straccali Leonardo</a>
        </span>
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
                    :disable="loading"
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
                  @click="transformSampleImg('r')"
                  :disable="loading"
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
                  @click="transformSampleImg('y')"
                  :disable="loading"
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
                  @click="transformSampleImg('x')"
                  :disable="loading"
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
  </q-layout>
</template>

<script setup lang="ts">
import { Matrix } from "ml-matrix";
import { onMounted, ref, watch } from "vue";
import { CanvasUtils } from "../utils/CanvasUtils";
import { PolynomialUtils } from "../utils/PolynomialUtils";
import { MathfieldElement } from "mathlive";
import { DataStructures } from "../assets/dataStructures";
import { useQuasar } from "quasar";
import GroupInfoDialog from "./GroupInfoDialog.vue";
const mfe = new MathfieldElement();
const loading = ref(false);

// selectable groups
const groups: Array<Group> = DataStructures.groups;
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
var timerCallNormalize = 0;

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
var filePicker: any;

// variable used to normalize the geneo by different values from the default
const normalizeBy = ref(0);

// group selected by the user
const groupSelected = ref<Group>({
  label: "",
  description: "",
  permutants: [],
  unknowns: [],
});

// Used to open the information dialog for using the group section
const $q = useQuasar();
function showGroupInfoDialog() {
  $q.dialog({
    component: GroupInfoDialog,
    componentProps: {
      groupSelected: groupSelected,
    },
  });
}

// Used to load the sample image
function onFileChange(e: any) {
  var files = e.target.files || e.dataTransfer.files;
  var reader = new FileReader();
  reader.onload = () => {
    sampleImg.src = reader.result as string;
    // when the image is loaded it calls the initSampleImage function
    sampleImg.onload = () => initSampleImage();
  };
  reader.readAsDataURL(files[0]);
}

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
            groupSelected.value
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
            loading.value = false;
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
  console.log("sono passato");
};

/**
 * I acquire the image data and transform it into a matrix
 * then call showGeneo to show the geneo in the event of an
 * image change during previous processing
 */
const initSampleImage = () => {
  console.log("initSampleImage");
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
 * method to transform the sampleImage and the geneo throw the buttons
 */
const transformSampleImg = (type: string) => {
  loading.value = true;
  if (sampleImg) {
    var ctx = canvasSample.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      CanvasUtils.clearCanvas(canvasSample);
      ctx.translate(Math.floor(canvasSize / 2), Math.floor(canvasSize / 2));
      if (type === "r") {
        ctx.rotate((+90 * Math.PI) / 180);
      } else if (type === "x") {
        ctx.scale(1, -1);
      } else if (type === "y") {
        ctx.scale(-1, 1);
      }
      ctx.translate(-Math.floor(canvasSize / 2), -Math.floor(canvasSize / 2));
      ctx.drawImage(sampleImg, 0, 0, canvasSize, canvasSize);
      sampleImg.src = canvasSample.toDataURL();
      ctx.resetTransform();
      initSampleImage();
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
  filePicker = document.getElementById("filePicker");

  // binds the contents of the math field with the polynomial variable
  if (document.getElementById("formula")) {
    document.getElementById("formula")!.addEventListener("input", (ev: any) => {
      poly.value = ev.target.value;
    });
  }
});

/**
 * watch at the normalizeBy variable to normalize de geneo and show it
 * if the normalizeBy is changed,
 * the method prevents to run if the showGeneo method has just been executed
 */
watch(normalizeBy, () => {
  if (!justShowGeneo) {
    if (timerCallNormalize) {
      clearTimeout(timerCallNormalize);
    }
    timerCallNormalize = setTimeout(() => {
      if (geneoMatrix) {
        var geneoMatrixNormalized = polyUtils.normalizeGeneo(
          geneoMatrix,
          +normalizeBy.value
        );

        CanvasUtils.drawMatrix(geneoMatrixNormalized, canvasGeneo);
      }
    }, 200);
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
  [poly, groupSelected],
  () => {
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
</script>

<style scoped>
@import "mathlive/dist/mathlive-fonts.css";
a {
  text-decoration: none;
  color: black;
}
</style>
