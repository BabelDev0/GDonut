<template>
  <q-layout view="hHh Lpr fFf">
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar square size="40px">
            <img src="/logo.png" />
          </q-avatar>
          Calculator
        </q-toolbar-title>
        <!-- FILE PICKER -->
        <div class="q-my-xs" style="max-width: 300px">
          <q-file
            outlined
            v-model="filePicker"
            label="select image"
            label-color="white"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" color="white" />
            </template>
          </q-file>
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
          />
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
    </q-drawer>

    <!-- MAIN -->
    <q-page-container>
      <!-- GENEO CANVAS -->
      <div class="full-width row justify-center">
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
                  />
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
                  @click="initTestImage('r')"
                />
              </div>
              <div class="q-my-sm q-ml-sm">
                <q-btn
                  round
                  size="sm"
                  color="primary"
                  icon="flip"
                  @click="initTestImage('y')"
                />
              </div>
              <div class="q-my-sm q-ml-sm">
                <q-btn
                  round
                  size="sm"
                  color="primary"
                  icon="flip"
                  class="rotate-90"
                  @click="initTestImage('x')"
                />
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
                <span class="text-weight-bold">Description : </span>
                <q-input
                  square
                  v-model="groupSelected.description"
                  autogrow
                  class="full-width q-mt-sm q-mb-md"
                  outlined
                  :readonly="true"
                >
                  <template v-slot:prepend>
                    <q-chip color="primary" text-color="white" icon="calculate">
                      {{ groupSelected.label }}
                    </q-chip>
                  </template>
                </q-input>

                <span class="text-weight-bold">Permutants : </span>
                <div class="full-width row justify-center q-mt-sm">
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
              </q-card-section>
            </q-step>

            <q-step
              :name="2"
              title="Write polynomial"
              caption="Optional"
              icon="create_new_folder"
              :done="groupStep > 2"
            >
              <div class="full-width row justify-center q-pa-lg">
                <span class="text-weight-bold q-mb-lg">
                  Write your polynomial in the input box as shown below
                </span>
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
                      use \sigma_n as the n-th elementary symmetric polynomial
                      and h_n
                    </span>
                  </li>
                  <li class="q-mt-sm">
                    <span class="text-weight-bold">
                      use h_n as the n-th permutant of the group
                    </span>
                  </li>
                  <li class="q-mt-sm">
                    <span class="text-weight-bold">
                      remember not to omit any operand such as the * in
                      multiplication and if you want to perform division
                      multiply by the reciprocal
                    </span>
                  </li>
                </ul>
              </div>
            </q-step>

            <q-step
              :name="3"
              title="Write polynomial"
              caption="Optional"
              icon="create_new_folder"
              :done="groupStep > 2"
            >
              <div class="full-width row justify-center q-pa-lg">
                <span class="text-weight-bold q-mb-lg">
                  Write your polynomial in the input box as shown below
                </span>
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
                      use \sigma_n as the n-th elementary symmetric polynomial
                      and h_n
                    </span>
                  </li>
                  <li class="q-mt-sm">
                    <span class="text-weight-bold">
                      use h_n as the n-th permutant of the group
                    </span>
                  </li>
                  <li class="q-mt-sm">
                    <span class="text-weight-bold">
                      remember not to omit any operand such as the * in
                      multiplication and if you want to perform division
                      multiply by the reciprocal
                    </span>
                  </li>
                </ul>
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
import { save } from "@tauri-apps/api/dialog";
import { writeBinaryFile, BaseDirectory } from "@tauri-apps/api/fs";
import { MathfieldElement } from "mathlive";
const mfe = new MathfieldElement();

var canvasGeneo: any;
var canvasOriginal: any;
var testImg = new Image();
var testImgMatrix: Matrix;
const canvasSize = ref(0);
const drawerSize = ref(500);
const filePicker = ref(null);
const leftDrawerOpen = ref(true);
const polynomial = ref<string>("");
const polynomialTest = ref<string>("");
const stateWrite = ref(false);

const permutants: Array<Permutant> = [
  {
    label: "h_1",
    internalName: "rot",
    description: "rotations around the centre of the image by 90 degrees",
    value: "90",
  },
  {
    label: "h_2",
    internalName: "rot",
    description: "rotations around the centre of the image by -90 degrees",
    value: "-90",
  },
  {
    label: "h_3",
    internalName: "rot",
    description: "rotations around the centre of the image by 180 degrees",
    value: "180",
  },
  {
    label: "h_4",
    internalName: "rot",
    description: "rotations around the centre of the image by 360 degrees",
    value: "360",
  },
  {
    label: "h_1",
    internalName: "lin",
    description: "linear translations of (x,y) pixels",
    value: "x,y",
  },
  {
    label: "h_2",
    internalName: "lin",
    description: "linear translations of (y,-x) pixels",
    value: "y,-x",
  },
  {
    label: "h_3",
    internalName: "lin",
    description: "linear translations of (-x,-y) pixels",
    value: "-x,-y",
  },
  {
    label: "h_4",
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

const download_image = async () => {
  const filePath = await save({
    defaultPath: BaseDirectory.Desktop + "/geneo.png",
    filters: [
      {
        name: "Image",
        extensions: ["jpg", "png"],
      },
    ],
  });
  var ctx = canvasGeneo.getContext("2d", { willReadFrequently: true });
  var geneoImageData = ctx.getImageData(
    0,
    0,
    canvasSize.value,
    canvasSize.value
  );
  console.log(filePath, geneoImageData);
  const res = await writeBinaryFile(filePath, geneoImageData);
  console.log(res);
};

const showGeneo = () => {
  if (testImg) {
    if (polynomial.value != "") {
      try {
        var polynomialUtils = new PolynomialUtils(
          testImgMatrix,
          testImg,
          canvasSize.value,
          groupSelected.value.permutants,
          groupSelected.value.unknowns
        );
        var geneoMatrix = polynomialUtils.evaluate(polynomial.value);
        console.log(geneoMatrix);
      } catch (e) {
        var ctx = canvasGeneo.getContext("2d");
        ctx.clearRect(0, 0, canvasSize.value, canvasSize.value);
        return;
      }

      if (geneoMatrix!) {
        CanvasUtils.drawMatrix(geneoMatrix, canvasGeneo);
      }
    } else {
      var ctx = canvasGeneo.getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, canvasGeneo.width, canvasGeneo.height);
    }
  } else {
    console.log("image dosen't exist");
  }
};

const initTestImage = (type: string) => {
  if (testImg) {
    var ctx = canvasOriginal.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.clearRect(0, 0, canvasSize.value, canvasSize.value);

      if (type !== "") {
        // move the context to the center of the canvas
        ctx.translate(
          Math.floor(canvasSize.value / 2),
          Math.floor(canvasSize.value / 2)
        );
        if (type === "r") {
          ctx.rotate((+90 * Math.PI) / 180);
        }
        if (type === "x") {
          ctx.scale(1, -1);
        } else if (type === "y") {
          ctx.scale(-1, 1);
        }

        // move the context back to the top left of the canvas
        ctx.translate(
          -Math.floor(canvasSize.value / 2),
          -Math.floor(canvasSize.value / 2)
        );
      }
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
  const example = "-\\sigma_1(h_1,h_2)+3\\cdot\\sigma_2(h_1,h_2)^2";
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
        testImg.onload = () => initTestImage("");
      };
      reader.readAsDataURL(newVal);
    }
  },
  { immediate: true }
);

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
