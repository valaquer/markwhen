<script setup lang="ts">
import { useTimelineStore } from "../timelineStore";
import { computed, ref } from "vue";
import TimelineScale from "../Settings/TimelineScale.vue";
import AutoCenter from "./AutoCenter.vue";
import CollapseAll from "./CollapseAll.vue";
import ExpandAll from "./ExpandAll.vue";
import ToggleMode from "./ToggleMode.vue";
import ToggleNowLine from "./ToggleNowLine.vue";
import SettingsButton from "./SettingsButton.vue";
import { useMarkwhenStore } from "@/Markwhen/markwhenStore";
import ToggleDateTimeDisplay from "./ToggleDateTimeDisplay.vue";
import ToggleShowProgress from "./ToggleShowProgress.vue";
import UserRanges from "./UserRanges.vue";

const timelineStore = useTimelineStore();
const markwhenStore = useMarkwhenStore();

const styleLeftInset = computed(() => {
  let inset = timelineStore.pageSettings.viewport.offsetLeft;
  if (timelineStore.mode === "gantt") {
    return (
      inset +
      (timelineStore.ganttSidebarTempWidth
        ? timelineStore.ganttSidebarTempWidth
        : timelineStore.ganttSidebarWidth)
    );
  }
  return inset;
});

const copyToClipboard = async (s: string, description?: string) => {
  if (!navigator.clipboard) {
    return alert("Clipboard not available :/");
  }
  try {
    await navigator.clipboard.writeText(s);
    alert(`Copied ${description}to clipboard.`);
  } catch (e) {
    console.error(e);
    alert("Unable to copy to clipboard:" + e);
  }
};

const copyTimelineLink = async () =>
  copyToClipboard(markwhenStore.timelineLink, "link ");

const copyEmbedLink = async () =>
  copyToClipboard(markwhenStore.embedLink, "embed code ");

const goToNow = () => timelineStore.goToNow();

const openFacade = () => {
  window.open('http://localhost:51730', '_blank');
};
</script>

<template>
  <div
    class="fixed hover:text-th-text-hover text-th-text-muted"
    :style="`left: ${styleLeftInset}px; bottom: 0rem; right: 0;`"
  >
    <div
      class="flex flex-row-items-center overflow-scroll noScrollBar relative"
    >
      <div class="flex flex-row gap-2 pt-16">
        <div class="settings-bar flex flex-row items-center gap-4 px-4 pointer-events-auto">
          <button @click="openFacade" class="settings-btn" style="margin-left: -2px;">Fire up Facade</button>
          <button @click="goToNow" class="settings-btn">Now</button>
          <AutoCenter></AutoCenter>
          <TimelineScale></TimelineScale>
          <ToggleDateTimeDisplay></ToggleDateTimeDisplay>
          <ToggleShowProgress></ToggleShowProgress>
          <ExpandAll></ExpandAll>
          <CollapseAll></CollapseAll>
          <ToggleNowLine></ToggleNowLine>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-bar {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 400;
  color: #808080;
  background: transparent;
  border-top: 1px dashed #282a30;
  padding-top: 6px;
  padding-bottom: 6px;
}
.settings-btn {
  cursor: pointer;
  background: transparent;
  border: none;
  color: #808080;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  padding: 0;
}
.settings-btn:hover {
  color: #c8c8c8;
}
</style>
