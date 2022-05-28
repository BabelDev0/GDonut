<template>
  <div class="full-width row justify-center">
    <q-input v-model="polyString" label="Polinomio" />
    <div class="q-gutter-sm content-align-center">
      <q-btn round color="primary" icon="send" @click="showGeneo()" />
    </div>
  </div>
  <div class="full-width row justify-center">
    <div class="column justify-start">
      <canvas
        class="q-mt-md q-mb-xs"
        id="myCanvasGeneo"
        :width="xCanvas"
        :height="yCanvas"
        style="border: 1px solid blue"
      >
        Your browser does not support the HTML5 canvas tag.</canvas
      >
      <div class="row justify-start">
        <small>{{ xCanvas }}X{{ yCanvas }} </small>
      </div>
    </div>
  </div>
  <div class="full-width row justify-center">
    <canvas
      class="q-ma-md"
      id="myCanvas1"
      :width="xCanvas"
      :height="yCanvas"
      style="border: 1px solid blue"
    >
      Your browser does not support the HTML5 canvas tag.</canvas
    >
  </div>
</template>

<script setup lang="ts">
import { Matrix } from "ml-matrix";
import { onMounted, ref } from "vue";
import { useMatrixCanvas } from "../composables/useMatrixCanvas";
import { usePoly } from "../composables/usePoly";

const polyString = ref<string>("");

var myCanvasGeneo: HTMLCanvasElement;
var myCanvas1: HTMLCanvasElement;

var testImg = new Image();
var testImgMatrix: Matrix;

const xCanvas = ref<number>(0);
const yCanvas = ref<number>(0);

const showGeneo = () => {
  var geneoMatrix = usePoly().evalPolyStupid(
    polyString.value,
    testImgMatrix,
    testImg
  );
  if (geneoMatrix) {
    useMatrixCanvas().drawMatrix(geneoMatrix, myCanvasGeneo);
  }
};

const initTestImage = () => {
  var ctx = myCanvas1.getContext("2d");
  ctx?.clearRect(0, 0, myCanvas1.width, myCanvas1.height);

  ctx!.drawImage(testImg, 0, 0);

  var testImgData = ctx!.getImageData(0, 0, testImg.width, testImg.height);
  testImgMatrix = useMatrixCanvas().arrayCanvasToMatrix(
    testImgData.data,
    testImg.width,
    testImg.height
  );
};

onMounted(() => {
  myCanvas1 = <HTMLCanvasElement>document.getElementById("myCanvas1");
  myCanvasGeneo = <HTMLCanvasElement>document.getElementById("myCanvasGeneo");

  testImg.src = "../../unibo.png";
  testImg.onload = () => initTestImage();

  xCanvas.value = testImg.width;
  yCanvas.value = testImg.height;
});
</script>

<style scoped></style>
