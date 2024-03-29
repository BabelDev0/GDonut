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
					/>
					<q-btn
						flat
						round
						size="lg"
						color="white"
						icon="info"
						@click="showUsageInfoDialog()"
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
							group info
						</q-tooltip>
					</q-btn>
				</div>
			</div>
			<!-- POLY -->
			<div
				class="full-width"
				style="display: flex; align-items: center; justify-content: flex-start"
			>
				<span
					v-if="isPolyEmpty"
					class="absolute q-pl-sm"
					style="color: grey; font-size: medium"
				>
					Enter your formula here
				</span>
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
			<!-- MADE BY -->
			<div
				class="row justify-center full-width absolute-bottom q-mb-sm"
				style="color: #bb2e29"
			>
				<span>
					made by <span style="color: black">Straccali Leonardo</span>
				</span>
			</div>
		</q-drawer>

		<!-- MAIN -->
		<q-page-container>
			<!-- GENEO CANVAS -->
			<div class="full-width row justify-center q-mt-sm">
				<div class="column justify-start q-mt-md">
					<div class="q-mr-lg q-pr-sm">
						<div class="row">
							<!-- CANVAS COMPONENT -->
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
						<!-- CANVAS SIZE LABEL -->
						<div class="row justify-start q-mt-xs">
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
import GroupInfoDialog from "./dialog/GroupInfoDialog.vue";
import UsageInfoDialog from "./dialog/UsageInfoDialog.vue";
const mfe = new MathfieldElement();
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

// polynomial to be evaluated
const poly = ref<string>("");

// mange placeholder for the polynomial input
const previousPoly = ref<string>("");
const isPolyEmpty = ref(true);

// drawer settings
const drawerSize = 500;
const leftDrawerOpen = true;

// class use to evaluate the polynomial and generate the geneo
var polyUtils: PolynomialUtils;

// variable used to trigger the picker of the sample image
var filePicker: any;

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
function showUsageInfoDialog() {
	$q.dialog({
		component: UsageInfoDialog,
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

const reloadWindow = () => {
	window.location.reload();
};

/**
 * method to calculate the geneo matrix and paint it on the canvas
 */
const showGeneo = () => {
	if (!sampleImgMatrix) {
		console.log("Sample image not exist");
		return;
	}
	if (groupSelected.value.label === "") {
		console.log("Group not selected");
		return;
	}
	if (poly.value === "") {
		console.log("Polynomial string is blank");
		CanvasUtils.clearCanvas(canvasGeneo);
		return;
	}

	try {
		polyUtils = new PolynomialUtils(
			sampleImgMatrix,
			sampleImg,
			canvasSize,
			groupSelected.value
		);

		// Geneo matrix already mapped to [0,255] range
		geneoMatrix = polyUtils.evaluate(poly.value);
		console.log("Geneo", geneoMatrix);

		if (geneoMatrix) {
			CanvasUtils.drawMatrix(geneoMatrix, canvasGeneo);
		}
	} catch (e) {
		CanvasUtils.clearCanvas(canvasGeneo);
		console.log(e);
		return;
	}
};

/**
 * I acquire the image data and transform it into a matrix
 * then call showGeneo to show the geneo in the event of an
 * image change during previous processing
 */
const initSampleImage = () => {
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
	if (sampleImg && sampleImgMatrix) {
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

	const mf = document.getElementById("formula");

	// binds the contents of the math field with the polynomial variable
	// and show the placeholder if the polynomial is empty
	if (mf) {
		mf.addEventListener("input", (ev: any) => {
			isPolyEmpty.value = ev.target.value == "" && previousPoly.value != "";
			poly.value = ev.target.value;
			previousPoly.value = poly.value;
		});
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
</style>
