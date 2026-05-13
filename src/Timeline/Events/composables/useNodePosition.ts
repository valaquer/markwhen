import { ROW_HEIGHT, HEADER_OFFSET } from "@/config/palette";
import { useCollapseStore } from "@/Timeline/collapseStore";
import type { Path } from "@markwhen/parser";
import type { MaybeRef } from "@vueuse/core";
import { computed, unref } from "vue";
import { useTimelineStore } from "../../timelineStore";
import { useNodeStore } from "../../useNodeStore";

export const useNodePosition = (path: MaybeRef<Path>) => {
  const collapseStore = useCollapseStore();
  const nodeStore = useNodeStore();

  const collapsedParent = computed(() =>
    collapseStore.isCollapsedChildOf(unref(path))
  );

  const isCollapsed = computed(() => !!collapsedParent.value);

  const top = computed(() => {
    const numAbove = nodeStore.predecessorMap.get(
      collapsedParent.value
        ? collapsedParent.value.join(",")
        : unref(path).join(",")
    )!;

    return HEADER_OFFSET + numAbove * ROW_HEIGHT;
  });

  return { top, isCollapsed };
};
