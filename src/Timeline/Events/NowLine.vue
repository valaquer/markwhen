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
  <div class="absolute flex flex-row gap-2" :style="`top: 62px; left: ${left - 240}px; z-index: 99;`">
    <!-- Forest -->
    <div class="flex flex-col gap-px items-center">
      <div style="font-size: 8px; color: #888;">1</div>
      <div style="width: 20px; height: 20px; background: #2d4a3e;"></div>
      <div style="font-size: 8px; color: #888;">2</div>
      <div style="width: 20px; height: 20px; background: #4a6858;"></div>
    </div>
    <!-- Sage -->
    <div class="flex flex-col gap-px items-center">
      <div style="font-size: 8px; color: #888;">3</div>
      <div style="width: 20px; height: 20px; background: #3a5f4a;"></div>
      <div style="font-size: 8px; color: #888;">4</div>
      <div style="width: 20px; height: 20px; background: #5a7a6a;"></div>
    </div>
    <!-- Steel -->
    <div class="flex flex-col gap-px items-center">
      <div style="font-size: 8px; color: #888;">5</div>
      <div style="width: 20px; height: 20px; background: #3b4d5e;"></div>
      <div style="font-size: 8px; color: #888;">6</div>
      <div style="width: 20px; height: 20px; background: #5a7080;"></div>
    </div>
    <!-- Slate -->
    <div class="flex flex-col gap-px items-center">
      <div style="font-size: 8px; color: #888;">7</div>
      <div style="width: 20px; height: 20px; background: #3a4555;"></div>
      <div style="font-size: 8px; color: #888;">8</div>
      <div style="width: 20px; height: 20px; background: #586878;"></div>
    </div>
    <!-- Burgundy -->
    <div class="flex flex-col gap-px items-center">
      <div style="font-size: 8px; color: #888;">9</div>
      <div style="width: 20px; height: 20px; background: #4a3838;"></div>
      <div style="font-size: 8px; color: #888;">10</div>
      <div style="width: 20px; height: 20px; background: #6a5454;"></div>
    </div>
    <!-- Copper -->
    <div class="flex flex-col gap-px items-center">
      <div style="font-size: 8px; color: #888;">11</div>
      <div style="width: 20px; height: 20px; background: #5a3e2e;"></div>
      <div style="font-size: 8px; color: #888;">12</div>
      <div style="width: 20px; height: 20px; background: #7a5e4a;"></div>
    </div>
    <!-- Indigo -->
    <div class="flex flex-col gap-px items-center">
      <div style="font-size: 8px; color: #888;">13</div>
      <div style="width: 20px; height: 20px; background: #3a3a54;"></div>
      <div style="font-size: 8px; color: #888;">14</div>
      <div style="width: 20px; height: 20px; background: #5a5a74;"></div>
    </div>
    <!-- Plum -->
    <div class="flex flex-col gap-px items-center">
      <div style="font-size: 8px; color: #888;">15</div>
      <div style="width: 20px; height: 20px; background: #4a3a4e;"></div>
      <div style="font-size: 8px; color: #888;">16</div>
      <div style="width: 20px; height: 20px; background: #6a5a6e;"></div>
    </div>
    <!-- Olive -->
    <div class="flex flex-col gap-px items-center">
      <div style="font-size: 8px; color: #888;">17</div>
      <div style="width: 20px; height: 20px; background: #4a4a30;"></div>
      <div style="font-size: 8px; color: #888;">18</div>
      <div style="width: 20px; height: 20px; background: #6a6a4e;"></div>
    </div>
    <!-- Ash -->
    <div class="flex flex-col gap-px items-center">
      <div style="font-size: 8px; color: #888;">19</div>
      <div style="width: 20px; height: 20px; background: #3e3e3e;"></div>
      <div style="font-size: 8px; color: #888;">20</div>
      <div style="width: 20px; height: 20px; background: #5e5e5e;"></div>
    </div>
  </div>
</template>

<style scoped></style>
