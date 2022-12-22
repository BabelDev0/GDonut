<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card
      class="q-dialog-plugin"
      style="width: 40vw; max-width: 80vw; max-width: 900px; min-width: 600px"
    >
      <q-toolbar>
        <q-toolbar-title> </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="close"
          v-close-popup
          @click="usageStep = 1"
        />
      </q-toolbar>
      <div class="row justify-center">
        <p style="font-size: 36px">Description of the application</p>
        <p class="q-mx-lg text-justify" style="font-size: 18px">
          The program allows to display a GENEO generated through the selection
          of a group, a permutant of the group and an image as input data
          function.<span class="q-ml-xs"
            >The result is then scaled through a constant that can be changed by
            the user.</span
          >
        </p>
        <p class="q-mx-lg text-justify" style="font-size: 18px">
          The software obtains the result shown through the application of
          theorems and mathematical settings described by the paper
          <span style="color: #bb2e29">
            "On the Construction of Group Equivariant Non-Expansive Operators
            via Permutants and Symmetric Functions"</span
          >
        </p>
        <p style="font-size: 26px">Steps to follow</p>
      </div>
      <div>
        <q-stepper
          v-model="usageStep"
          flat
          vertical
          color="primary"
          animated
          inactive-color="primary"
          style="padding-top: 0"
        >
          <q-step
            :name="1"
            title="Choose sample image"
            icon="image"
            active-icon="image"
            done-icon="image"
            :done="usageStep > 1"
            @click="usageStep = 1"
          >
            <p style=" font-size: 18px">
              Click on the top right button
              <q-icon
                name="cloud_upload"
                size="sm"
                color="primary"
                class="q-mb-xs"
              ></q-icon>
              to select the sample image to work on, the image will be shown in
              the square at the bottom center of the main screen
            </p>
          </q-step>
          <q-step
            :name="2"
            title="Choose a group"
            icon="group_work"
            active-icon="group_work"
            done-icon="group_work"
            :done="usageStep > 2"
            @click="usageStep = 2"
          >
            <p style=" font-size: 18px">
              Select a group from the list of groups that you find in the upper
              left corner
              <span
                class="q-mx-xs q-pa-xs"
                style="
                  color: #bb2e29;
                  border: 1px;
                  border-style: solid;
                  border-color: #bb2e29;
                "
              >
                <q-icon name="expand_more" size="sm"></q-icon>Group
              </span>
              to get information about the group and how to use the side drawer
              section click on the
              <q-icon
                name="info"
                size="sm"
                color="primary"
                class="q-mb-xs"
              ></q-icon>
              button next to the chosen group
            </p>
          </q-step>
          <q-step
            :name="3"
            title="Write the polynomial"
            icon="functions"
            active-icon="functions"
            done-icon="functions"
            :done="usageStep > 3"
            @click="usageStep = 3"
            style="max-height: 19em"
          >
            <p style=" font-size: 18px">
              In the group information section that you find by clicking the
              button
              <q-icon
                name="info"
                size="sm"
                color="primary"
                class="q-mb-xs q-mr-xs"
              ></q-icon
              >next to the selected group you will also find the rules for
              writing the polynomial in the input box. <br />
              Once you have written the polynomial the program will show the
              result in the top square in the main section of the program
            </p>
            <p style="color: #bb2e29; font-size: 18px">
              if the polynomial is formed incorrectly, the geneo canvas will
              turn white
            </p>
          </q-step>
          <q-step
            :name="4"
            title="Manipulate sample image"
            icon="refresh"
            active-icon="refresh"
            done-icon="refresh"
            :done="usageStep > 4"
            @click="usageStep = 4"
          >
            <p style=" font-size: 18px">
              With the buttons<q-icon
                name="rotate_90_degrees_cw"
                size="sm"
                color="primary"
                class="q-mb-xs q-mx-xs"
              ></q-icon>
              <q-icon
                name="flip"
                size="sm"
                color="primary"
                class="q-mb-xs q-mr-xs"
              ></q-icon>
              <q-icon
                name="flip"
                size="sm"
                color="primary"
                class="q-mb-xs q-mr-xs rotate-90"
              ></q-icon>
              next to the sample image square (bottom square) you can
              respectively rotate by 90 degrees, reflect by x and y the sample
              image.
            </p>
            <p style=" font-size: 18px">
              these transformations is also reflected on the top pane where we
              show the result of the operation
            </p>
          </q-step>
        </q-stepper>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDialogPluginComponent } from "quasar";

// used to track which information panel I'm at
const usageStep = ref(1);

// REQUIRED by dialog plugin
const { dialogRef, onDialogHide } = useDialogPluginComponent();
defineEmits([...useDialogPluginComponent.emits]);
</script>
