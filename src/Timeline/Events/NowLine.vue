<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { DateTime } from "luxon";
import { useTimelineStore } from "../timelineStore";
import { useNodeStore } from "../useNodeStore";

const timelineStore = useTimelineStore();
const nodeStore = useNodeStore();
const now = ref(DateTime.now());

const setNow = () => {
  now.value = DateTime.now();
  setTimeout(() => setNow(), 1000 * 6);
};

onMounted(() => {
  setNow();
});

const left = computed(() => {
  return Math.min(
    Math.max(0, timelineStore.distanceFromBaselineLeftmostDate(now.value)),
    timelineStore.pageSettings.viewport.width * 6
  );
});
</script>

<template>
  <div
    v-if="!timelineStore.hideNowLine"
    class="absolute bg-th-now-line top-0 bottom-0"
    :style="`width: 1px; left: ${left}px; height: max(${nodeStore.viewHeight}, 100%);`"
  ></div>
  <div class="absolute flex flex-row gap-1" :style="`top: 72px; left: ${left - 120}px; z-index: 99;`">
    <div style="width: 20px; height: 20px; background: #2d4a3e;"></div>
    <div style="width: 20px; height: 20px; background: #3a5f4a;"></div>
    <div style="width: 20px; height: 20px; background: #4a6858;"></div>
    <div style="width: 20px; height: 20px; background: #5a7a6a;"></div>
    <div style="width: 20px; height: 20px; background: #3b4d5e;"></div>
    <div style="width: 20px; height: 20px; background: #4a6070;"></div>
    <div style="width: 20px; height: 20px; background: #5c4a4a;"></div>
    <div style="width: 20px; height: 20px; background: #6b4c3a;"></div>
    <div style="width: 20px; height: 20px; background: #6b5a50;"></div>
    <div style="width: 20px; height: 20px; background: #4a4a5c;"></div>
    <div style="width: 20px; height: 20px; background: #5a5060;"></div>
  </div>
</template>

<style scoped></style>
