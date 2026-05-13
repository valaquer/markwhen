<script setup lang="ts">
import { ROW_HEIGHT, HEADER_OFFSET, SWIMLANE_PADDING, GROUP_PADDING } from "@/config/palette";
import { computed, ref, watch } from "vue";
import { useTimelineStore } from "@/Timeline/timelineStore";
import { useEventColor } from "../composables/useEventColor";
import ExpandedSectionBackground from "./ExpandedSectionBackground.vue";
import { toInnerHtml } from "@/Timeline/utilities/innerHtml";
import SectionHeader from "./SectionHeader.vue";
import { ranges } from "@/utilities/ranges";
import { equivalentPaths, type EventPath } from "@/Timeline/paths";
import { recurrenceLimit } from "@/Timeline/timelineStore";
import { useCollapseStore } from "@/Timeline/collapseStore";
import type { Eventy } from "@markwhen/parser";
import type { Sourced } from "@/Markwhen/useLpc";
import type { EventGroup } from "@markwhen/parser";
import { isEvent, Event, toDateRange } from "@markwhen/parser";

const timelineStore = useTimelineStore();
const collapseStore = useCollapseStore();
const { setHoveringEvent, clearHoveringEvent } = timelineStore;
const props = defineProps<{
  eventy: EventGroup;
  path: string;
  numChildren?: number | undefined;
  numAbove: number;
  groupStyle?: "group" | "section";
}>();

const { scalelessDistanceBetweenDates, scalelessDistanceFromReferenceDate } =
  timelineStore;

const collapsed = computed({
  get: () => collapseStore.isCollapsed(props.path),
  set: (val) => collapseStore.setCollapsed(props.path, val),
});
const hovering = ref(false);
const hoveringPath = computed(() => timelineStore.hoveringEventPaths);
const ourPath = computed<EventPath>(() =>
  props.path.split(",").map((i) => parseInt(i))
);
const toggle = (e: MouseEvent) => {
  if (e.target instanceof HTMLAnchorElement) {
    return;
  }
  e.preventDefault();
  collapsed.value = !collapsed.value;
};

const sectionRange = computed(() => ranges(props.eventy, recurrenceLimit));

const left = computed(() => {
  if (!props.eventy || !sectionRange.value) {
    return 10;
  }
  return scalelessDistanceBetweenDates(
    timelineStore.baselineLeftmostDate,
    sectionRange.value.fromDateTime
  );
});

const { color } = useEventColor(
  computed(() => props.eventy as Sourced<Eventy>)
);

const measureTextWidth = (text: string, fontSize: string): number => {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 0;
  ctx.font = `${fontSize} system-ui`;
  return Math.ceil(ctx.measureText(text).width);
};

const fullWidth = computed(() => {
  if (!props.eventy || !sectionRange.value) {
    return 100;
  }
  const dateWidth = scalelessDistanceBetweenDates(
    sectionRange.value.fromDateTime,
    sectionRange.value.toDateTime
  );
  if (props.eventy.style !== "section" && props.eventy.children) {
    let maxOverflow = 0;
    for (const child of props.eventy.children) {
      if (!isEvent(child)) continue;
      const event = child as Sourced<Event>;
      const eventRange = toDateRange(event.dateRangeIso);
      if (!eventRange) continue;
      const fullText = ((event.firstLine?.datePart || "") + " " + (event.firstLine?.restTrimmed || "")).trim();
      const textPx = measureTextWidth(fullText, "12px");
      const barRight = scalelessDistanceBetweenDates(
        timelineStore.baselineLeftmostDate,
        eventRange.toDateTime
      );
      const textScale = textPx / timelineStore.pageScaleBy24;
      const groupRight = left.value + dateWidth;
      const contentEnd = barRight + textScale;
      maxOverflow = Math.max(maxOverflow, contentEnd - groupRight);
    }
    return dateWidth + Math.max(0, maxOverflow);
  }
  return dateWidth;
});
const titleHtml = computed(() => toInnerHtml(props.eventy.title || ""));

const hover = (isHovering: boolean) => {
  hovering.value = isHovering;
};

watch(hovering, (h) => {
  if (h) {
    setHoveringEvent(props.path.split(",").map((i) => parseInt(i)));
  } else {
    clearHoveringEvent();
  }
});

const groupStyle = computed(() =>
  props.groupStyle
    ? props.groupStyle
    : timelineStore.mode === "gantt"
    ? "section"
    : props.eventy.style === "section"
    ? "section"
    : "group"
);

const width = computed(
  () => `${timelineStore.pageScaleBy24 * fullWidth.value}px`
);

const top = computed(() => HEADER_OFFSET + props.numAbove * ROW_HEIGHT);

const height = computed(() => {
  const base = ROW_HEIGHT + props.numChildren! * ROW_HEIGHT;
  if (groupStyle.value === "section") return base + SWIMLANE_PADDING;
  return base + GROUP_PADDING * 2;
});

const styleObject = computed(() => ({
  top: `${top.value}px`,
  transition: `top 200ms cubic-bezier(0.4, 0, 0.2, 1)`,
  display: collapseStore.isCollapsedChild(props.path) ? "none" : "block",
  ...(groupStyle.value === "section"
    ? {
        left: 0,
        right: `-350%`,
      }
    : {}),
}));

const hovered = computed(
  () => hovering.value || equivalentPaths(hoveringPath.value, ourPath.value)
);
</script>

<template>
  <div class="absolute" :style="styleObject">
    <div class="relative flex flex-col">
      <ExpandedSectionBackground
        :hovering="hovered"
        :style="groupStyle"
        :eventy="eventy"
        :left="left"
        :height="height"
        :full-width="fullWidth"
        :path="path"
      />
      <div
        class="sticky top-0 cursor-pointer"
        :style="{
          width,
        }"
      ></div>
      <SectionHeader
        :path="path"
        @toggle="toggle"
        @hover="hover"
        :hovering="hovered"
        :expanded="!collapsed"
        :titleHtml="titleHtml"
        :color="color"
        :num-children="eventy.children.length"
        :group-style="groupStyle"
        :left="left"
        :full-width="fullWidth"
      ></SectionHeader>
    </div>
  </div>
</template>

<style scoped></style>
