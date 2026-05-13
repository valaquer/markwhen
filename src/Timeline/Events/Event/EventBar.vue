<script setup lang="ts">
import { computed } from "vue";
import { useTimelineStore } from "../../timelineStore";

const timelineStore = useTimelineStore();

const props = defineProps<{
  percent: number;
  tagColor?: string;
  hovering: boolean;
  width: number;
  taskNumerator: number;
  taskDenominator: number;
  expandedRecurrence: number[];
}>();
const isGantt = computed(() => timelineStore.mode === "gantt");
const color = computed(() => {
  return props.tagColor || null;
});

const recurrenceBarStyleObj = (left: number) => {
  const isGantt = timelineStore.mode === "gantt";
  return {
    left: `${left}px`,
    width: `${props.width}px`,
    backgroundColor: `magenta`,
    border: color.value ? `1px solid rgba(${color.value}, 0.3)` : "",
    height: isGantt ? `15px` : `10px`,
    borderRadius: isGantt ? `0.125rem` : `2px`,
    flexShrink: 0,
  };
};

const barHeight = computed(() => (isGantt.value ? 15 : 10));

const recurrencePercentBarStyleObj = (left: number) => {
  const isGantt = timelineStore.mode === "gantt";
  const obj = {
    minWidth: `10px`,
    // maxWidth: `100%`,
    ...(color.value ? { backgroundColor: `rgba(${color.value}, 0.8)` } : {}),
  } as any;
  obj.backgroundColor = `cyan`;
  obj.width = `${(props.percent * props.width) / 100}px`;
  obj.borderRadius = isGantt ? "0.125rem" : `2px`;
  obj.left = `${left}px`;
  return obj;
};

const recurrenceTotalWidth = computed(
  () =>
    props.expandedRecurrence[props.expandedRecurrence.length - 1] + props.width
);
</script>

<template>
  <div
    class="flex flex-row items-center eventBar"
    :style="`width: ${recurrenceTotalWidth}px`"
  >
    <template v-for="(instance, i) of expandedRecurrence" :key="i">
      <div class="relative items-center" :style="`height: ${barHeight}px;`">
        <div
          :class="{
            'eventBar transition shadow top-0 absolute': true,
            'bg-th-bar-empty opacity-30': !color,
          }"
          :style="recurrenceBarStyleObj(instance)"
        ></div>
        <div
          class="absolute top-0 bottom-0 percentBar transition"
          :class="{
            'bg-th-progress-bar border border-th-bar-border':
              !color,
            'opacity-100 shadow-lg': hovering,
            'opacity-60': !hovering,
          }"
          :style="recurrencePercentBarStyleObj(instance)"
        ></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.eventBar {
  grid-row: 1;
  grid-column: 1;
}
</style>
