<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar square size="40px">
            <img src="../../public/logo.png" />
          </q-avatar>
          Calculator
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="400"
      :breakpoint="700"
      elevated
      behavior="desktop"
    >
      <!-- drawer content -->
      <div class="full-width row justify-center">
        <q-input
          class="full-width"
          outlined
          v-model="polyString"
          label="Polinomio"
        >
          <template v-slot:append>
            <q-icon
              name="close"
              @click="polyString = ''"
              class="cursor-pointer"
            />
          </template>
        </q-input>
      </div>
      <div class="full-width">
        <q-file filled bottom-slots v-model="filePicker" label="Label" counter>
          <template v-slot:prepend>
            <q-icon name="cloud_upload" @click.stop />
          </template>
          <template v-slot:append>
            <q-icon
              name="close"
              @click.stop="filePicker = null"
              class="cursor-pointer"
            />
          </template>
        </q-file>
      </div>
    </q-drawer>

    <q-page-container>
      <div class="full-width row justify-center">
        <div class="column justify-start">
          <canvas
            class="q-mb-xs"
            id="myCanvasGeneo"
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
      <div class="full-width row justify-center">
        <div class="column justify-start">
          <canvas
            class="q-mt-md q-mb-xs"
            id="myCanvas1"
            :width="canvasSize"
            :height="canvasSize"
            style="border: 1px solid blue"
          >
            Your browser does not support the HTML5 canvas tag.</canvas
          >
          <div class="row justify-start">
            <small>{{ canvasSize }} X {{ canvasSize }} </small>
          </div>
        </div>
      </div>
      <!-- 
      <q-dialog v-model="alertPopup">
        <q-card>
          <q-card-section>
            <div class="text-h6">Errore nel polinomio inserito</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            the polynomial in input contains wrong or compound characters in an
            erroneous formulation:
            <br />
            permutants allowed are : a_1(x,y) | a_2(degree)
            <br />
            shortcut: halfX = (image width)/2 | halfY = (image height)/2
          </q-card-section>

          <q-card-actions>
            <q-btn flat label="OK" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog> -->
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { Matrix } from "ml-matrix";
import { debounce } from "quasar";
import { onMounted, ref, watch } from "vue";
import { useMatrixCanvas } from "../composables/useMatrixCanvas";
import { usePoly } from "../composables/usePoly";

const polyString = ref<string>("");
const filePicker = ref<File | null>();

var myCanvasGeneo: any;
var myCanvas1: any;

var testImg = new Image();
var testImgMatrix: Matrix;

const canvasSize = ref(0);

var alertPopup = ref(false);
const leftDrawerOpen = ref(true);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const showGeneo = () => {
  if (testImg) {
    try {
      var geneoMatrix = usePoly().evalPoly(
        polyString.value,
        testImgMatrix,
        testImg,
        canvasSize.value
      );
    } catch (e) {
      // alertPopup.value = true;
      return;
    }

    if (geneoMatrix!) {
      useMatrixCanvas().drawMatrix(geneoMatrix, myCanvasGeneo);
    }
  } else {
    console.log("image dosen't exist");
  }
};

const initTestImage = () => {
  if (testImg) {
    var ctx = myCanvas1.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // ctx.drawImage(testImg, 0, 0);
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

      testImgMatrix = useMatrixCanvas().arrayCanvasToMatrix(
        testImgData.data,
        canvasSize.value,
        canvasSize.value
      );
    } else {
      console.log("ctx dosen't exist");
    }
  } else {
    console.log("image dosen't exist");
  }
};

onMounted(() => {
  myCanvas1 = document.getElementById("myCanvas1");
  myCanvasGeneo = document.getElementById("myCanvasGeneo");
  canvasSize.value = 300;
});

const download_image = () => {
  var image = myCanvasGeneo
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
  var link = document.createElement("a");
  link.download = "geneo.png";
  link.href = image;
  link.click();
};

watch(polyString, () => showGeneo());

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
</script>

<style scoped></style>
