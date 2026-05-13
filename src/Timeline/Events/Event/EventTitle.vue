<script setup lang="ts">
import { onUpdated } from "vue";
import TaskCompletion from "./TaskCompletion.vue";
import { useTimelineStore } from "@/Timeline/timelineStore";

const emits = defineEmits<{ (event: "toggleMeta", e: MouseEvent): void }>();
const props = defineProps<{
  showingMeta: boolean;
  isHovering: boolean;
  hasMeta: boolean;
  hasSupplemental: boolean;
  completed?: boolean;
  taskDenominator: number;
  taskNumerator: number;
  titleHtml: string;
}>();

const timelineStore = useTimelineStore();
</script>

<template>
  <div class="eventTitle whitespace-nowrap py-1 flex flex-row" style="font-size: 12px; color: #c8c8c8; font-family: system-ui;">
    <div
      class="supplementalIndicators flex flex-row text-th-text-muted gap-1 items-center justify-center pl-2"
    >
      <!-- <button
        @click="emits('toggleMeta', $event)"
        class="rounded px-px pointer-events-auto border"
        v-if="hasMeta"
        :class="{
          'bg-th-event-detail-bg border-th-accent/75': showingMeta,
          shadow: isHovering || showingMeta,
          'text-th-text-muted bg-th-surface-alt border-transparent':
            !showingMeta,
        }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path
            d="M 17 14 l -5 -6 l -5 6 h 10"
            :transform="`rotate(${showingMeta ? 0 : 180} 12 12)`"
          ></path>
        </svg>
      </button> -->
      <!-- <svg
        v-if="hasLocations"
        class="h-4 w-4"
        focusable="false"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        ></path>
      </svg> -->
      <task-completion
        v-if="
          timelineStore.progressDisplay === 'on' &&
          (taskDenominator || typeof completed !== 'undefined')
        "
        :taskNumerator="taskNumerator"
        :taskDenominator="taskDenominator"
        :completed="completed"
      />
    </div>
    <p class="ml-px">
      <span
        v-html="titleHtml"
        :class="{
          'pointer-events-auto': titleHtml.includes('underline'),
        }"
      ></span>

    </p>
  </div>
</template>

<style scoped></style>
