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
          :label="groupSelected == '' ? 'Group' : groupSelected"
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
            :label="item"
            :key="item"
          />
        </q-fab>
        <!-- select permutant -->
        <q-fab
          square
          flat
          v-model="permutant"
          label="Permutant"
          vertical-actions-align="left"
          color="primary"
          icon="add"
          direction="down"
          :disable="groupSelected == ''"
        >
          <q-fab-action
            v-for="permutant in listOfPermutantsByGroup"
            square
            color="primary"
            @click="selectPermutant(permutant)"
            :label="permutant.description"
            :key="permutant.description"
          />
        </q-fab>
      </div>
      <!-- POLY -->
      <div class="full-width row justify-center">
        <q-input
          square
          class="full-width"
          outlined
          v-model="polynomial"
          label="Polynomial"
        >
          <template v-slot:append>
            <q-icon
              name="close"
              @click="polynomial = ''"
              class="cursor-pointer"
            />
          </template>
        </q-input>
      </div>
      <!-- PERMUTANTS SELECTED -->
      <div class="full-width row justify-center q-pt-md">
        <q-input
          v-for="permutant in listOfPermutantSelected"
          square
          class="full-width"
          outlined
          v-model="permutant.value"
          :label="permutant.rules"
          :hint="permutant.description"
          :key="permutant.label"
        >
          <template v-slot:prepend>
            <q-chip color="primary" text-color="white" icon="calculate">
              {{ permutant.label }}
            </q-chip>
          </template>
          <template v-slot:append>
            <q-icon
              name="delete"
              @click="removePermutant(permutant.label)"
              class="cursor-pointer"
            />
          </template>
        </q-input>
      </div>
    </q-drawer>

    <!-- MAIN -->
    <q-page-container>
      <!-- GENEO CANVAS -->
      <div class="full-width row justify-center">
        <div class="column justify-start">
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
        <div class="column justify-start">
          <canvas
            class="q-mt-md q-mb-xs"
            id="canvasOriginal"
            :width="canvasSize"
            :height="canvasSize"
            style="border: 1px solid #bb2e29"
          >
            Your browser does not support the HTML5 canvas tag.</canvas
          >
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
import { desktopDir } from "@tauri-apps/api/path";

var canvasGeneo: any;
var canvasOriginal: any;
var testImg = new Image();
var testImgMatrix: Matrix;
const canvasSize = ref(0);
const drawerSize = ref(450);
const filePicker = ref(null);
const leftDrawerOpen = ref(true);
const polynomial = ref<string>("");

const group = ref(false);
const permutant = ref(false);
const groupSelected = ref("");
const groups = ["First", "Second"];
const listOfPermutantsByGroup = ref<Permutant[]>([]);
const listOfPermutantSelected = ref<Permutant[]>([]);

const listOfPermutants = [
  {
    label: "",
    internalName: "lin",
    description: "linear displacement",
    rules: "enter displacement in the format: x,y",
  },
  {
    label: "",
    internalName: "rot",
    description: "rotation around the center of the image",
    rules: "enter degrees: deg multiples of 90",
  },
  {
    label: "",
    internalName: "ref",
    description: "symmetry respect to axis or the origin",
    rules: "enter the axis: x or y or xy",
  },
];

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const selectGroup = (group: string) => {
  groupSelected.value = group;
  listOfPermutantsByGroup.value = [];
  listOfPermutantSelected.value = [];
  if (group == "First") {
    listOfPermutantsByGroup.value.push(listOfPermutants[0]);
    listOfPermutantsByGroup.value.push(listOfPermutants[1]);
  } else if (group == "Second") {
    listOfPermutantsByGroup.value.push(listOfPermutants[0]);
    listOfPermutantsByGroup.value.push(listOfPermutants[1]);
    listOfPermutantsByGroup.value.push(listOfPermutants[2]);
  }
};

const selectPermutant = (permutant: Permutant) => {
  listOfPermutantSelected.value.push({
    label: "a_" + (listOfPermutantSelected.value?.length + 1),
    description: permutant.description,
    rules: permutant.rules,
    internalName: permutant.internalName,
  });
};

const removePermutant = (label: string | undefined) => {
  listOfPermutantSelected.value = listOfPermutantSelected.value.filter(
    (permutant) => permutant.label != label
  );
  listOfPermutantSelected.value.forEach((permutant, index) => {
    permutant.label = "a_" + (index + 1);
  });
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
          listOfPermutantSelected.value
        );
        var geneoMatrix = polynomialUtils.evaluate(polynomial.value);
        console.log(geneoMatrix);
      } catch (e) {
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

onMounted(() => {
  canvasOriginal = document.getElementById("canvasOriginal");
  canvasGeneo = document.getElementById("canvasGeneo");
  canvasSize.value = 300;
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

watch([polynomial, listOfPermutantSelected], () => showGeneo(), { deep: true });
</script>

<style scoped></style>
