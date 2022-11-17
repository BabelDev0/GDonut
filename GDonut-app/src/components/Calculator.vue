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
      <!-- GROUP AND PERMUTANT -->
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
      <!-- PERMUTANTS -->
      <!-- UNKNOWNS -->
      <div class="full-width row justify-center q-pt-md">
        <q-input
          v-for="unknown in groupSelected.unknowns"
          square
          class="w-auto q-mx-xs"
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
      <!-- LIST OF PERMUTANTS -->
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
        <div class="column justify-start q-mr-lg">
          <canvas
            class="q-mb-xs"
            id="canvasGeneo"
            :width="canvasSize"
            :height="canvasSize"
            style="border: 1px solid #bb2e29"
          >
            Your browser does not support the HTML5 canvas tag.</canvas
          >
          <div class="row justify-start">
            <small>{{ canvasSize }} X {{ canvasSize }} </small>
          </div>
          <div class="row justify-end">
            <q-btn
              push
              color="primary"
              label="Print"
              size="13px"
              @click="download_image()"
            />
          </div>
        </div>
      </div>
      <!-- TEST CANVAS -->
      <div class="full-width row justify-center">
        <div class="">
          <div class="row">
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
      "Gruppo formato dalle rotazioni intorno al centro dell'immagine per multipli interi di 90 gradi",
    permutants: [permutants[4], permutants[5], permutants[6], permutants[7]],
    unknowns: [
      { label: "x", value: "0" },
      { label: "y", value: "0" },
    ],
  },
];

const group = ref(false);
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
        console.log(e);
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
  canvasSize.value = 300;
  if (document && document.getElementById("formula")) {
    document.getElementById("formula")!.addEventListener("input", (ev: any) => {
      polynomial.value = ev.target.value;
    });
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
