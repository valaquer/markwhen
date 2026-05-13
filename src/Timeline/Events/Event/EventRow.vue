<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import {
  toDateRange,
  expand,
  type Block,
  type DateRange,
  type DateTimeIso,
  type MarkdownBlock,
  type Range,
  type Recurrence,
} from "@markwhen/parser";
import { ROW_HEIGHT } from "@/config/palette";
import { useTimelineStore } from "@/Timeline/timelineStore";
import EventBar from "@/Timeline/Events/Event/EventBar.vue";
import EventTitle from "./EventTitle.vue";
import type { EventPath } from "@/Timeline/paths";
import Fade from "@/Transitions/Fade.vue";
import { recurrenceLimit } from "@/Timeline/timelineStore";
import { useNodePosition } from "../composables/useNodePosition";

const props = defineProps<{
  path: EventPath;
  tags: string[];
  dateText: string;
  supplemental: MarkdownBlock[];
  matchedListItems: Range[];
  hovering: boolean;
  percent?: number;
  rangeFrom: DateTimeIso;
  rangeTo: DateTimeIso;
  titleHtml: string;
  color?: string;
  isDetailEvent: boolean;
  numAbove: number;
  completed?: boolean;
  recurrence?: Recurrence;
  source: string;
}>();

const emit = defineEmits<{
  (event: "hover", hovering: boolean): void;
}>();

const timelineStore = useTimelineStore();

const eventBar = ref();
const showingMeta = ref(false);
const hasMeta = computed(() => !!props.supplemental.length);

const toggleMeta = (e: MouseEvent) => {
  if (e.target instanceof HTMLAnchorElement) {
    return;
  }
  e.preventDefault();
  showingMeta.value = !showingMeta.value;
};

const taskNumerator = computed(
  () =>
    props.supplemental.filter(
      (block) => block.type === "checkbox" && (block as Block).value
    ).length
);
const taskDenominator = computed(
  () => props.supplemental.filter((block) => block.type === "checkbox").length
);
const canShowMeta = computed(() => {
  if (props.supplemental.length) {
    return showingMeta.value;
  }
  return false;
});


const elementHover = ref(false);

watch(elementHover, (hovering) => emit("hover", hovering));

const isHovering = computed(
  () => elementHover.value || props.hovering
);

const range = computed(() =>
  toDateRange({
    fromDateTimeIso: props.rangeFrom,
    toDateTimeIso: props.rangeTo,
  })
);

const expandedRecurrence = computed(() =>
  (props.recurrence
    ? expand(range.value, props.recurrence, recurrenceLimit)
    : [range.value]
  ).map((dr) =>
    timelineStore.distanceBetweenDates(
      range.value.fromDateTime,
      dr.fromDateTime
    )
  )
);

const dimensions = computed(() => {
  const left = timelineStore.distanceFromBaselineLeftmostDate(
    range.value.fromDateTime
  );

  const width = timelineStore.distanceBetweenDates(
    range.value.fromDateTime,
    range.value.toDateTime
  );
  const scaledWidth = Math.max(10, width - 10);

  return {
    left,
    width: scaledWidth,
  };
});

const left = computed(() => {
  return dimensions.value.left;
});

const clickStart = ref<{ x: number; y: number }>();
const eventDetail = () => {
  timelineStore.setDetailEventPath(props.path);
};

const percent = computed(() => {
  const p = props.percent as number;
  if (!isNaN(p)) {
    return p;
  }
  if (!isNaN(taskNumerator.value) && taskDenominator.value > 0) {
    return (taskNumerator.value / taskDenominator.value) * 100;
  }
  return 100;
});

const { top, isCollapsed } = useNodePosition(computed(() => props.path));

const isGantt = computed(() => timelineStore.mode === "gantt");

const styleObj = computed(() => {
  let obj = {
    top: `${top.value}px`,
    height: `${ROW_HEIGHT}px`,
    transition: `top 200ms cubic-bezier(0.4, 0, 0.2, 1)`,
  } as any;
  obj.left = isGantt.value ? "0px" : `${left.value}px`;
  if (isGantt.value) {
    obj.right = "-350%";
  }
  return obj;
});

const classObj = computed(() => {
  return isGantt.value
    ? {
        // border: true,
        "bg-th-event-detail-bg": props.isDetailEvent,
        "border-th-border-strong":
          props.hovering && !props.isDetailEvent,
        "border-th-accent": props.isDetailEvent,
        "border-transparent": !props.hovering && !props.isDetailEvent,
        "bg-th-hover-bg/10": props.hovering,
      }
    : {
        "pointer-events-none": isCollapsed.value,
      };
});

const barAndTitleClass = computed(() => {
  return isGantt.value
    ? {}
    : {
        "bg-th-event-detail-bg shadow-lg":
          (isHovering.value && hasMeta.value) || props.isDetailEvent,
        "ring-1 ring-th-border-strong":
          props.hovering && !props.isDetailEvent,
        "ring-1 ring-th-accent": props.isDetailEvent,
        "pointer-events-auto cursor-pointer": !isCollapsed.value,
      };
});

const mousedown = (e: MouseEvent | TouchEvent) => {
  const x = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
  const y = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
  clickStart.value = { x, y };
};

const mouseup = (e: MouseEvent | TouchEvent) => {
  const x = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
  const y = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
  if (clickStart.value?.x === x && clickStart.value.y === y) {
    eventDetail();
  }
};

const ganttTitleStyle = computed(() => {
  const styleObj = {} as any;
  if (props.color) {
    styleObj.backgroundColor = `rgba(${props.color}, 0.5)`;
  }
  styleObj.width = `${
    timelineStore.ganttSidebarTempWidth
      ? timelineStore.ganttSidebarTempWidth
      : timelineStore.ganttSidebarWidth
  }px`;
  return styleObj;
});
</script>

<template>
  <div
    class="eventRow absolute"
    :class="classObj"
    :style="styleObj"
    @mouseenter.passive="!isCollapsed && (elementHover = true)"
    @mouseleave.passive="elementHover = false"
  >
    <div
      class="absolute top-0 bottom-0 flex items-center pr-4 text-xs text-gray-400 source"
      style="transform: translateX(-100%)"
      v-if="source !== 'default' && !isCollapsed && isHovering"
    >
      {{ source }}
    </div>
    <div
      class="flex flex-row eventContent items-center h-full"
      :style="isGantt ? `margin-left: ${left}px` : ''"
    >
      <div class="eventItem pointer-events-none">
        <div
          class="flex flex-row rounded -mx-2 px-2 eventBarAndTitle"
          :class="barAndTitleClass"
          v-on="isCollapsed ? {} : { mousedown, mouseup }"
        ></div>
        <event-bar
          ref="eventBar"
          :tagColor="color"
          :percent="percent"
          :hovering="isHovering || hovering"
          :width="dimensions.width"
          :taskNumerator="taskNumerator"
          :taskDenominator="taskDenominator"
          :expandedRecurrence="expandedRecurrence"
        />
        <Fade>
          <p
            class="eventDate py-1 whitespace-nowrap" style="font-family: system-ui; font-size: 11px;"
            v-show="
              !isCollapsed && timelineStore.dateTimeDisplay === 'original'
            "
            :class="
              recurrence
                ? 'text-th-accent-light'
                : 'text-gray-400'
            "
          >
            {{ dateText }}
          </p>
        </Fade>
        <Fade>
          <event-title
            v-if="timelineStore.mode === 'timeline'"
            v-show="!isCollapsed"
            :showing-meta="showingMeta"
            :is-hovering="isHovering"
            :has-meta="hasMeta"
            :has-supplemental="!!supplemental.length"
            :task-denominator="taskDenominator"
            :task-numerator="taskNumerator"
            :completed="completed"
            :title-html="titleHtml"
            @toggle-meta="toggleMeta"
          ></event-title>
        </Fade>
      </div>
    </div>
  </div>
  <div
    class="absolute left-0 pointer-events-none"
    :style="{ height: `${ROW_HEIGHT}px`, top: `${top}px`, right: `-350%` }"
    v-if="timelineStore.mode === 'gantt' && !isCollapsed"
    @mouseenter.passive="elementHover = true"
    @mouseleave.passive="elementHover = false"
  >
    <div class="flex h-full">
      <div
        class="sticky left-0 z-10 h-full"
        :class="{
          'bg-th-hover-bg/10': hovering,
          'bg-th-surface': !hovering,
        }"
      >
        <div
          class="h-full pointer-events-auto"
          :class="{
            'border-transparent': !hovering && !isDetailEvent,
            'border-th-accent': isDetailEvent,
          }"
          style="
            cursor: pointer;
          "
          :style="ganttTitleStyle"
          @mousedown.passive="mousedown"
          @mouseup.passive="mouseup"
        >
          <event-title
            class="px-2 h-full"
            :showing-meta="showingMeta"
            :is-hovering="isHovering"
            :has-meta="hasMeta"
            :has-supplemental="!!supplemental.length"
            :task-denominator="taskDenominator"
            :task-numerator="taskNumerator"
            :completed="completed"
            :title-html="titleHtml"
            @toggle-meta="toggleMeta"
          ></event-title>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.photoBar {
  width: 10px;
}

.eventRow {
  padding-top: 2px;
  padding-bottom: 2px;
}

.eventDate {
  font-family: system-ui;
  margin: 0px 0px 0px 8px;
}

.source {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.eventTitle {
  font-family: system-ui;

  grid-row: 1;
  grid-column: 3;
}

/* .eventDescription {
  grid-row: 1 / -1;
  grid-column: 3 / -1;
} */

.eventBarAndTitle {
  grid-row: 1;
  /* grid-column: 1 / -1; */
  grid-column: 1 / 4;
}
.eventDate {
  grid-row: 1;
  grid-column: 2;
}
.eventMeta {
  grid-row: 2;
  grid-column: 3 / -1;
}

.eventItem {
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-template-rows: 1fr auto;
  align-items: center;
  height: 100%;
}
</style>
