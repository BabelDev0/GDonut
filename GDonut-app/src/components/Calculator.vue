<template>
  <h1>Calculator</h1>
  <div>
    <div>
      <input type="text" v-model="polyString" />
      <button @click="evalPoly()" name="Calcola">Calcola</button>
    </div>
    <canvas
      id="myCanvasGeneo"
      :width="xTorus"
      :height="yTorus"
      style="border: 1px solid blue"
    >
      Your browser does not support the HTML5 canvas tag.
    </canvas>
  </div>
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
  </div>
</template>

<script setup lang="ts">
import { Matrix } from "ml-matrix";
import { onMounted, ref } from "vue";
import { useMatrixCanvas } from "../composables/useMatrixCanvas";

const polyString = ref<string>("");

var myCanvasGeneo: HTMLCanvasElement;
var myCanvas1: HTMLCanvasElement;
var myCanvas2: HTMLCanvasElement;

var testImg = new Image();
var testImgMatrix: Matrix;

const xTorus = ref<number>(0);
const yTorus = ref<number>(0);

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

const evalPoly = () => {
  if (polyString.value && polyString.value.length !== 0) {
    var regex = /([\+\-\*\/])/;
    var poly = polyString.value.split(regex);
    var torusGeneo: Matrix;

    var precEl: string;
    poly.forEach((element) => {
      if (element.includes("a1")) {
        let pos = element
          .replace("a1", "")
          .replace(/[\])}[{(]/g, "")
          .split(",");

        if (pos.length === 1) {
          pos = ["0", "0"];
        }

        var torus_2 = putImgInTorus(
          +pos[0],
          +pos[1],
          testImgMatrix,
          xTorus.value,
          yTorus.value
        );

        if (precEl === "+") {
          torusGeneo.add(torus_2);
        } else if (precEl === "-") {
          torusGeneo.add(torus_2.negate());
        } else if (precEl === "*") {
          torusGeneo.mmul(torus_2);
        } else if (precEl === "/") {
          torusGeneo.div(torus_2);
        } else {
          torusGeneo = torus_2;
        }
      } else if (element.includes("a2")) {
        let degree = element.replace("a2", "").replace(/[\])}[{(]/g, "");
        if (degree.length === 0) {
          degree = "0";
        }

        var ctxRotate = myCanvas2.getContext("2d");
        ctxRotate?.clearRect(0, 0, myCanvas2.width, myCanvas2.height);
        ctxRotate?.translate(
          Math.floor(xTorus.value / 2),
          Math.floor(yTorus.value / 2)
        );
        ctxRotate?.rotate((+degree * Math.PI) / 180);
        ctxRotate?.translate(
          -Math.floor(xTorus.value / 2),
          -Math.floor(yTorus.value / 2)
        );
        ctxRotate!.drawImage(testImg, 0, 0);

        var testImgDataRotate = ctxRotate!.getImageData(
          0,
          0,
          testImg.width,
          testImg.height
        );

        var torus_2 = useMatrixCanvas().arrayCanvasToMatrix(
          testImgDataRotate.data,
          testImg.width,
          testImg.height
        );

        ctxRotate?.clearRect(0, 0, myCanvas2.width, myCanvas2.height);
        ctxRotate?.translate(
          Math.floor(xTorus.value / 2),
          Math.floor(yTorus.value / 2)
        );
        ctxRotate?.rotate((-degree * Math.PI) / 180);
        ctxRotate?.translate(
          -Math.floor(xTorus.value / 2),
          -Math.floor(yTorus.value / 2)
        );
        ctxRotate!.drawImage(testImg, 0, 0);

        if (precEl === "+") {
          torusGeneo.add(torus_2);
        } else if (precEl === "-") {
          torusGeneo.add(torus_2.negate());
        } else if (precEl === "*") {
          torusGeneo.mmul(torus_2);
        } else if (precEl === "/") {
          torusGeneo.div(torus_2);
        } else {
          torusGeneo = torus_2;
        }
      } else {
        precEl = element;
      }
    });

    useMatrixCanvas().drawMatrix(torusGeneo!.div(2), myCanvasGeneo);
  }
};

onMounted(() => {
  myCanvas1 = <HTMLCanvasElement>document.getElementById("myCanvas1");
  myCanvas2 = <HTMLCanvasElement>document.getElementById("myCanvas2");
  myCanvasGeneo = <HTMLCanvasElement>document.getElementById("myCanvasGeneo");

  testImg.src = "../../grey.png";
  testImg.onload = () => initTestImage();

  xTorus.value = testImg.width;
  yTorus.value = testImg.height;
});
</script>

<style scoped></style>
