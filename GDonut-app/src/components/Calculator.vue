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
        <div class="q-my-xs" style="max-width: 300px">
          <q-file outlined v-model="filePicker">
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
      <!-- drawer content -->
      <!-- group and permutant -->
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
      <!-- poly -->
      <div class="full-width row justify-center">
        <q-input
          square
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
      <!-- permutants selected -->
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
      <!-- TEST CANVAS -->
      <div class="full-width row justify-center">
        <div class="column justify-start">
          <canvas
            class="q-mt-md q-mb-xs"
            id="myCanvas1"
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
import { onMounted, ref, watch } from "vue";
import { useMatrixCanvas } from "../composables/useMatrixCanvas";
import { usePoly } from "../composables/usePoly";

const polyString = ref<string>("");
const filePicker = ref(null);

var myCanvasGeneo: any;
var myCanvas1: any;

var testImg = new Image();
var testImgMatrix: Matrix;

const canvasSize = ref(0);
const drawerSize = ref(450);

const group = ref(false);
const groups = ["Primo", "Secondo"];
const groupSelected = ref("");

const permutant = ref(false);
const listOfPermutants = [
  {
    label: "",
    internalName: "lin",
    description: "spostamento lineare su x e y",
    rules: "inserire spostamento nel formato: x,y",
  },
  {
    label: "",
    internalName: "rot",
    description: "rotazione intorno al centro dell'immagine",
    rules: "inserire i gradi: deg multipli di 90",
  },
  {
    label: "",
    internalName: "ref",
    description: "simmetria rispetto ad un asse o l'origine",
    rules: "inserire l'asse: x o y o xy",
  },
];
const listOfPermutantsByGroup = ref<Permutant[]>([]);
const listOfPermutantSelected = ref<Permutant[]>([]);

var alertPopup = ref(false);
const leftDrawerOpen = ref(true);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const selectGroup = (group: string) => {
  groupSelected.value = group;
  listOfPermutantsByGroup.value = [];
  listOfPermutantSelected.value = [];
  if (group == "Primo") {
    listOfPermutantsByGroup.value.push(listOfPermutants[0]);
    listOfPermutantsByGroup.value.push(listOfPermutants[1]);
  } else if (group == "Secondo") {
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

const download_image = () => {
  //ask to save canvas as image
};

const showGeneo = () => {
  if (testImg) {
    if (polyString.value != "") {
      try {
        var geneoMatrix = usePoly().evalPoly(
          polyString.value,
          testImgMatrix,
          testImg,
          canvasSize.value,
          listOfPermutantSelected.value
        );
        console.log(geneoMatrix);
      } catch (e) {
        // alertPopup.value = true;
        return;
      }

      if (geneoMatrix!) {
        useMatrixCanvas().drawMatrix(geneoMatrix, myCanvasGeneo);
      }
    } else {
      var ctx = myCanvasGeneo.getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, myCanvasGeneo.width, myCanvasGeneo.height);
    }
  } else {
    console.log("image dosen't exist");
  }
};

const initTestImage = () => {
  if (testImg) {
    //willReadFrequently
    var ctx = myCanvas1.getContext("2d", { willReadFrequently: true });
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

      testImgMatrix = useMatrixCanvas().arrayCanvasToMatrix(
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
  myCanvas1 = document.getElementById("myCanvas1");
  myCanvasGeneo = document.getElementById("myCanvasGeneo");
  canvasSize.value = 300;
  // Math.floor(window.innerWidth * 0.25) < 200
  //   ? 200
  //   : Math.floor(window.innerWidth * 0.25);
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

watch([polyString, listOfPermutantSelected], () => showGeneo(), { deep: true });
</script>

<style scoped></style>
