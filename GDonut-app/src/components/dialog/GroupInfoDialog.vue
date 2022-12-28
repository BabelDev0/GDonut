<template>
	<q-dialog ref="dialogRef" @hide="onDialogHide">
		<q-card
			class="q-dialog-plugin"
			style="width: 40vw; max-width: 80vw; max-width: 900px; min-width: 600px"
		>
			<q-toolbar>
				<q-toolbar-title
					><span class="text-weight-bold">Group : </span>
					{{ groupSelectedRef.label }}</q-toolbar-title
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
						icon="group_work"
						active-icon="group_work"
						done-icon="group_work"
						:done="groupStep > 1"
					>
						<q-card-section>
							<div class="full-width text-center">
								<h6 class="q-mt-xs q-mb-lg">
									{{ groupSelectedRef.description }}
								</h6>
							</div>
							<div v-if="groupSelectedRef.unknowns.length > 0">
								<p>
									<span class="text-weight-bold">Unknowns : </span>Be sure to
									assign the variables that will be used by the permutant
								</p>
								<div class="full-width row justify-center">
									<q-input
										v-for="unknown in groupSelectedRef.unknowns"
										square
										class="w-auto q-mx-xs q-mb-sm"
										outlined
										v-model="unknown.value"
										:key="unknown.label"
										readonly
										style="width: 200px"
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
									<span class="text-weight-bold"
										>List of variables used when writing the polynomial.
									</span>
									Each of these variables is the result of the input function
									composed with one of the elements belonging to the permutant
								</p>
								<div class="full-width row justify-center">
									<q-input
										v-for="permutant in groupSelectedRef.permutants"
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
						icon="functions"
						active-icon="functions"
						done-icon="functions"
						:done="groupStep > 2"
					>
						<div
							class="full-width row justify-center q-pa-lg"
							style="font-size: 17px"
						>
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
									max-width: 500px;
								"
								readonly="true"
								keypress-sound="none"
								plonk-sound="none"
							>
								{{ samplePoly }}
							</math-field>

							<div>
								<p class="q-mt-md text-center">
									the polynomial must be written in latex
								</p>
								<ul>
									<li class="q-mt-sm">
										<span>
											<span style="color: #bb2e29">Use</span>
											\sigma_n as the n-th elementary symmetric polynomial
										</span>
									</li>
									<li class="q-mt-sm">
										<span>
											<span style="color: #bb2e29">Use</span>
											a_n as the variables corresponsive to the result obtained
											from the action of the permutant elements on the input
											image
										</span>
									</li>
									<li class="q-mt-sm">
										<span>
											<span style="color: #bb2e29">Note</span>
											don't omit any operand such as the * in multiplication
										</span>
									</li>
									<li class="q-mt-sm">
										<span>
											<span style="color: #bb2e29">Note</span>
											if you want to perform division multiply by the reciprocal
										</span>
									</li>
									<li class="q-mt-sm">
										<span>
											<span style="color: #bb2e29">Note</span>
											be very careful when writing in the subscript of elements
											because you may unintentionally continue writing the
											remainder in subscript e.g. a_{1,a_2} instead a_1,a_2
										</span>
									</li>
								</ul>
								<p class="text-center" style="color: #bb2e29">
									if the polynomial is formed incorrectly, the geneo canvas will
									turn white
								</p>
							</div>
						</div>
					</q-step>

					<q-step
						:name="3"
						title="Linear transformation"
						icon="tune"
						active-icon="tune"
						done-icon="tune"
						:done="groupStep > 2"
					>
						<div class="full-width row justify-center q-pa-lg">
							<div>
								<h6 class="q-mt-xs q-mb-xs text-center">
									Linear transformation
								</h6>

								<p class="text-justify q-mt-md" style="font-size: 17px">
									In order to display the result, we need to map the range of
									values in the result matrix to a range that can be displayed
									on a screen. This is done by mapping the range [m, M], where m
									is the minimum value of the pixel belonging to the result
									matrix and M is the maximum value, to the range [0, 255].
								</p>
								<p class="text-justify q-mt-md" style="font-size: 17px">
									This is done by the program by mapping the range [m, M] to the
									range [0, 255], where m is the minimum value of the pixel
									belonging to the result matrix and M is the maximum value.
								</p>
								<p class="text-justify q-mt-md" style="font-size: 17px">
									By mapping the range of values in the result matrix to the
									range [0, 255], we can ensure to see the full range of colors
									and details in the image, rather than having the image appear
									as a flat black or white due to the overflow of values outside
									of the range that can be displayed.
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
								label="Continue"
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
</template>

<script setup lang="ts">
import { PropType, ref, watch } from "vue";
import { useDialogPluginComponent } from "quasar";
import { MathfieldElement } from "mathlive";
const mfe = new MathfieldElement();

const props = defineProps({
	groupSelected: {
		type: Object as PropType<Group>,
		required: true,
	},
});

// used to track which information panel I'm at
const groupStep = ref(1);

// used to show the autocomplete polynomial in the second step
const sample =
	"-\\sigma_1(a_1,a_2)+3\\cdot\\sigma_2(a_1,a_2)^2-6\\cdot\\sigma_1(a_1,a_2)";
const samplePoly = ref("");

const stateWrite = ref(false);
const normalizeBy = ref(0);
const groupSelectedRef = ref(props.groupSelected);

// REQUIRED by dialog plugin
const { dialogRef, onDialogHide } = useDialogPluginComponent();
defineEmits([...useDialogPluginComponent.emits]);

const writeSamplePoly = () => {
	var i = 0;
	samplePoly.value = "";
	var interval = setInterval(() => {
		if (!stateWrite.value) {
			clearInterval(interval);
		}
		samplePoly.value += sample[i];
		i++;

		if (i >= sample.length) {
			clearInterval(interval);
			setTimeout(() => {
				writeSamplePoly();
			}, 2000);
		}
	}, 250);
};

watch(groupStep, () => {
	if (groupStep.value === 2) {
		stateWrite.value = true;
		writeSamplePoly();
	} else {
		stateWrite.value = false;
	}
});
</script>
