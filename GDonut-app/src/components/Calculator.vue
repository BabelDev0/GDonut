<template>
  <q-layout view="hHh Lpr fFf">
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

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
          <q-btn
            flat
            round
            size="lg"
            color="white"
            icon="info"
            @click="reload()"
          />
          <q-btn
            flat
            round
            size="lg"
            color="white"
            icon="refresh"
            @click="reload()"
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
        <!-- select group -->
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
            @click="selectGroup(item)"
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
          v-model="constToNormalize"
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
                id="canvasOriginal"
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
                  @click="initTestImage()"
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
                  @click="initTestImage()"
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
                  @click="initTestImage()"
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
                      v-model="constToNormalize"
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
const mfe = new MathfieldElement();

var canvasGeneo: any;
var canvasOriginal: any;
var testImg = new Image();
var testImgMatrix: Matrix;
var polynomialUtils: PolynomialUtils;
var geneoMatrix: Matrix | null;
var afterGeneo = true;
const canvasSize = ref(0);
const drawerSize = ref(500);
const filePicker = ref(null);
const leftDrawerOpen = ref(true);
const polynomial = ref<string>("");
const polynomialTest = ref<string>("");
const stateWrite = ref(false);
const constToNormalize = ref(0);

const permutants: Array<Permutant> = [
  {
    label: "a_1",
    internalName: "rot",
    description: "rotations around the centre of the image by 90 degrees",
    value: "90",
  },
  {
    label: "a_2",
    internalName: "rot",
    description: "rotations around the centre of the image by -90 degrees",
    value: "-90",
  },
  {
    label: "a_3",
    internalName: "rot",
    description: "rotations around the centre of the image by 180 degrees",
    value: "180",
  },
  {
    label: "a_4",
    internalName: "rot",
    description: "rotations around the centre of the image by 360 degrees",
    value: "360",
  },
  {
    label: "a_1",
    internalName: "lin",
    description: "linear translations of (x,y) pixels",
    value: "x,y",
  },
  {
    label: "a_2",
    internalName: "lin",
    description: "linear translations of (y,-x) pixels",
    value: "y,-x",
  },
  {
    label: "a_3",
    internalName: "lin",
    description: "linear translations of (-x,-y) pixels",
    value: "-x,-y",
  },
  {
    label: "a_4",
    internalName: "lin",
    description: "linear translations of (-y,x) pixels",
    value: "-y,x",
  },
];
const groups: Array<Group> = [
  {
    label: "G1",
    description:
      "Group formed by rotations around the centre of the image by integer multiples of 90 degrees and a symmetry on the y-axis",
    permutants: [permutants[0], permutants[1], permutants[2], permutants[3]],
    unknowns: [],
  },
  {
    label: "G2",
    description:
      "Group formed by rotations around the centre of the image by integer multiples of 90 degrees",
    permutants: [permutants[4], permutants[5], permutants[6], permutants[7]],
    unknowns: [
      { label: "x", value: "0" },
      { label: "y", value: "0" },
    ],
  },
];

const group = ref(false);
const groupDialog = ref(false);
const groupStep = ref(1);
const groupSelected = ref<Group>({
  label: "",
  description: "",
  permutants: [],
  unknowns: [],
});

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const selectGroup = (group: Group) => {
  groupSelected.value = group;
};

const download_image = async () => {};

const showGeneo = () => {
  if (testImg && testImgMatrix) {
    if (groupSelected.value.label !== "") {
      if (polynomial.value != "") {
        try {
          polynomialUtils = new PolynomialUtils(
            testImgMatrix,
            testImg,
            canvasSize.value,
            groupSelected.value.permutants,
            groupSelected.value.unknowns
          );
          geneoMatrix = polynomialUtils.evaluate(polynomial.value);
          console.log("Geneo", geneoMatrix);
        } catch (e) {
          var ctx = canvasGeneo.getContext("2d");
          ctx.clearRect(0, 0, canvasSize.value, canvasSize.value);
          console.log(e);
          return;
        }

        if (geneoMatrix) {
          var geneoMatrixNormalized = polynomialUtils.normalizeGeneo(
            geneoMatrix,
            -1
          );
          afterGeneo = true;
          constToNormalize.value = polynomialUtils.constToNormalize;
          console.log("Normalized", geneoMatrixNormalized);
          CanvasUtils.drawMatrix(geneoMatrixNormalized, canvasGeneo);
        }
      } else {
        var ctx = canvasGeneo.getContext("2d");
        ctx.clearRect(0, 0, canvasGeneo.width, canvasGeneo.height);
      }
    } else {
      console.log("Group not selected");
    }
  } else {
    console.log("Test image not exist");
  }
};

const initTestImage = () => {
  if (testImg) {
    var ctx = canvasOriginal.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.clearRect(0, 0, canvasSize.value, canvasSize.value);
      ctx.drawImage(
        testImg,
        0,
        0,
        testImg.width,
        testImg.height,
        0,
        0,
        canvasSize.value,
        canvasSize.value
      );

      var testImgData = ctx.getImageData(
        0,
        0,
        canvasSize.value,
        canvasSize.value
      );

      testImgMatrix = CanvasUtils.canvasToMatrix(
        testImgData.data,
        canvasSize.value,
        canvasSize.value
      );

      showGeneo();
    } else {
      console.log("ctx dosen't exist");
    }
  } else {
    console.log("image dosen't exist");
  }
};

const reload = () => {
  window.location.reload();
};

onMounted(() => {
  canvasOriginal = document.getElementById("canvasOriginal");
  canvasGeneo = document.getElementById("canvasGeneo");
  canvasSize.value = 350;
  if (document && document.getElementById("formula")) {
    document.getElementById("formula")!.addEventListener("input", (ev: any) => {
      polynomial.value = ev.target.value;
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

watch(
  filePicker,
  (newVal) => {
    if (newVal) {
      var reader = new FileReader();
      reader.onload = () => {
        testImg.src = reader.result as string;
        testImg.onload = () => initTestImage();
      };
      reader.readAsDataURL(newVal);
    }
  },
  { immediate: true }
);

watch(constToNormalize, () => {
  if (!afterGeneo) {
    if (geneoMatrix) {
      var geneoMatrixNormalized = polynomialUtils.normalizeGeneo(
        geneoMatrix,
        +constToNormalize.value
      );

      CanvasUtils.drawMatrix(geneoMatrixNormalized, canvasGeneo);
    }
  } else {
    afterGeneo = false;
  }
});

var timer = 0;
watch(
  [polynomial, groupSelected],
  () => {
    // delay the execution of the function showGeneo
    // to avoid the execution of the function when the user is typing

    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      console.log("show geneo");
      showGeneo();
    }, 200);
  },
  { deep: true }
);
</script>

<style scoped>
@import "mathlive/dist/mathlive-fonts.css";
.rotate_image {
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>
