<template>
  <h1>Calculator</h1>
  <div>
    <canvas
      id="myCanvas1"
      :width="xTorus"
      :height="yTorus"
      style="border: 1px solid blue"
    >
      Your browser does not support the HTML5 canvas tag.</canvas
    >
    <canvas
      id="myCanvas2"
      :width="xTorus"
      :height="yTorus"
      style="border: 1px solid blue"
    >
      Your browser does not support the HTML5 canvas tag.</canvas
    >
    <canvas
      id="myCanvas3"
      :width="xTorus"
      :height="yTorus"
      style="border: 1px solid blue"
    >
      Your browser does not support the HTML5 canvas tag.</canvas
    >
  </div>
  <div>
    <input type="number" v-model="xZeroImg" />
    <input type="number" v-model="yZeroImg" />
    <input type="number" v-model="degrees" />
  </div>
</template>

<script setup lang="ts">
import { Matrix } from "ml-matrix";
import { onMounted, ref, watch } from "vue";
import { useMatrixCanvas } from "../composables/useMatrixCanvas";

const xZeroImg = ref<number>(0);
const yZeroImg = ref<number>(0);
const degrees = ref<number>(0);

var myCanvas1: HTMLCanvasElement;
var myCanvas2: HTMLCanvasElement;
var myCanvas3: HTMLCanvasElement;

var testImg = new Image();
var testImgData: ImageData;
var testImgMatrix: Matrix;

const xTorus = ref<number>(0);
const yTorus = ref<number>(0);
var torus1 = new Matrix(yTorus.value, xTorus.value * 4);
var torus2 = new Matrix(yTorus.value, xTorus.value * 4);
var torus3 = new Matrix(yTorus.value, xTorus.value * 4);

const initTestImage = () => {
  var ctx = myCanvas1.getContext("2d");
  ctx?.clearRect(0, 0, myCanvas1.width, myCanvas1.height);

  ctx!.drawImage(testImg, 0, 0);
  testImgData = ctx!.getImageData(0, 0, testImg.width, testImg.height);
  testImgMatrix = useMatrixCanvas().arrayCanvasToMatrix(
    testImgData.data,
    testImg.width,
    testImg.height
  );
};

const putImgInTorus = (
  xImgInTorus: number,
  yImgInTorus: number,
  imgMatrix: Matrix,
  xDimensionTorus: number,
  yDimensionTorus: number
): Matrix => {
  xDimensionTorus *= 4;
  let torus = Matrix.zeros(yDimensionTorus, xDimensionTorus);

  xImgInTorus =
    xImgInTorus < 0
      ? xDimensionTorus + (xImgInTorus % xDimensionTorus)
      : xImgInTorus % xDimensionTorus;
  xImgInTorus *= 4;

  yImgInTorus =
    yImgInTorus < 0
      ? yDimensionTorus + (yImgInTorus % yDimensionTorus)
      : yImgInTorus % yDimensionTorus;

  for (
    var yTorus = yImgInTorus;
    yTorus - yImgInTorus < imgMatrix.rows;
    yTorus++
  ) {
    for (
      var xTorus = xImgInTorus;
      xTorus - xImgInTorus < imgMatrix.columns;
      xTorus += 4
    ) {
      torus.set(
        yTorus % yDimensionTorus,
        xTorus % xDimensionTorus,
        imgMatrix.get(yTorus - yImgInTorus, xTorus - xImgInTorus)
      );
      torus.set(
        yTorus % yDimensionTorus,
        (xTorus % xDimensionTorus) + 1,
        imgMatrix.get(yTorus - yImgInTorus, xTorus - xImgInTorus + 1)
      );
      torus.set(
        yTorus % yDimensionTorus,
        (xTorus % xDimensionTorus) + 2,
        imgMatrix.get(yTorus - yImgInTorus, xTorus - xImgInTorus + 2)
      );
      torus.set(
        yTorus % yDimensionTorus,
        (xTorus % xDimensionTorus) + 3,
        imgMatrix.get(yTorus - yImgInTorus, xTorus - xImgInTorus + 3)
      );
    }
  }
  return torus;
};

const polyOnMatrix = (matrixS1: Matrix, matrixS2: Matrix): Matrix => {
  let matrix1 = matrixS1.clone();
  let matrix2 = matrixS2.clone();
  let matrix3 = matrix1.add(matrix2).divide(2);

  return matrix3;
};

onMounted(() => {
  myCanvas1 = <HTMLCanvasElement>document.getElementById("myCanvas1");
  myCanvas2 = <HTMLCanvasElement>document.getElementById("myCanvas2");
  myCanvas3 = <HTMLCanvasElement>document.getElementById("myCanvas3");

  testImg.src = "../../unibo.png";
  testImg.onload = () => initTestImage();

  xTorus.value = testImg.width;
  yTorus.value = testImg.height;
});

watch([xZeroImg, yZeroImg, degrees], () => {
  torus1 = putImgInTorus(
    xZeroImg.value,
    yZeroImg.value,
    testImgMatrix,
    xTorus.value,
    yTorus.value
  );

  torus2 = putImgInTorus(
    xZeroImg.value + 128,
    yZeroImg.value + 128,
    testImgMatrix,
    xTorus.value,
    yTorus.value
  );

  torus3 = polyOnMatrix(torus1, torus2);
  useMatrixCanvas().drawMatrix(torus1, myCanvas1);
  useMatrixCanvas().drawMatrix(torus2, myCanvas2);
  useMatrixCanvas().drawMatrix(torus3, myCanvas3);
});
</script>

<style scoped></style>
