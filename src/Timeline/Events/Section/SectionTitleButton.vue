<script setup lang="ts">
import { computed, ref, watch } from "vue";
import DepthIndicator from "./DepthIndicator.vue";
import UpCaret from "./UpCaret.vue";
const props = defineProps<{
  color?: string;
  titleHtml: string;
  expanded: boolean;
  numChildren: number;
  groupStyle: "group" | "section";
  path: string;
}>();

const button = ref();

const emit = defineEmits<{
  (event: "click", e: MouseEvent): void;
  (event: "hovering", isHovering: boolean): void;
}>();

const styleObject = computed(() => {
  if (props.groupStyle === 'section') {
    return {};
  }
  return {
    backgroundColor: `#5a3e2e`,
  };
});

const click = (e: MouseEvent) => emit("click", e);
</script>

<template>
  <button
    ref="button"
    class="flex flex-row items-center bg-opacity-50"
    :class="{
      'bg-th-section-bg': !color && groupStyle !== 'section',
      'rounded-[3px] px-2 py-px': groupStyle === 'group',
      'px-1': groupStyle !== 'group',
    }"
    :style="styleObject"
    @mouseover.passive="emit('hovering', true)"
    @mouseleave.passive="emit('hovering', false)"
  >
    <DepthIndicator :depth="path.split(',').length" />
    <div class="flex flex-row flex-grow items-center justify-center">
      <span
        class="eventTitle whitespace-nowrap"
        :class="{ 'gradient-text': groupStyle === 'section' }"
        v-if="titleHtml"
        v-html="titleHtml"
        :style="groupStyle === 'section' ? 'font-size: 13px; font-weight: 500;' : 'font-size: 12px; font-weight: 700;'"
      >
      </span>
      <span
        class="eventTitle whitespace-nowrap ml-1"
        :class="{ 'gradient-text': groupStyle === 'section' }"
        :style="groupStyle === 'section' ? 'font-size: 11px; font-weight: 500;' : 'font-size: 10px; color: #999;'"
        v-if="!expanded"
        >({{ numChildren }})</span
      >
    </div>
    <UpCaret v-if="expanded" />
  </button>
</template>

<style scoped>
.eventTitle {
  font-family: Inter, system-ui, sans-serif;
}
.gradient-text {
  background: linear-gradient(90deg, #5c9cf5, #9d7cd8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.eventTitle :deep(a) {
  color: #888;
  font-weight: 400;
  text-decoration: none;
}
</style>
