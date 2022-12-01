<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card
      class="q-dialog-plugin"
      style="width: 40vw; max-width: 80vw; max-width: 900px; min-width: 600px"
    >
      <q-toolbar>
        <q-toolbar-title
          ><span class="text-weight-bold">Usage info</span>
        </q-toolbar-title>
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
            icon="settings"
            :done="groupStep > 1"
          >
            <h1>Description</h1>
          </q-step>

          <q-step
            :name="2"
            title="Write polynomial"
            icon="create_new_folder"
            :done="groupStep > 2"
          >
            <h1>List what to do</h1>
          </q-step>

          <template v-slot:navigation>
            <q-stepper-navigation>
              <q-btn
                v-if="groupStep < 2"
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
import { ref } from "vue";
import { useDialogPluginComponent } from "quasar";

// used to track which information panel I'm at
const groupStep = ref(1);

// REQUIRED by dialog plugin
const { dialogRef, onDialogHide } = useDialogPluginComponent();
defineEmits([...useDialogPluginComponent.emits]);
</script>
