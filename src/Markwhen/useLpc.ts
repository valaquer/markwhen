import { useColors } from "./useColors";
import {
  useLpc as baseUseLpc,
  type AppState,
  type MarkwhenState,
  type Message,
  type Sourced,
  type Source,
  type DisplayScale,
} from "@markwhen/view-client";

export const defaultSourceName = "default";

export const useLpc = (listeners?: Parameters<typeof baseUseLpc>[0]) =>
  baseUseLpc(listeners, {
    initialAppStateFromMarkwhen: (state: MarkwhenState) => ({
      colorMap: useColors(state.parsed).value,
    }),
  });

export type { AppState, MarkwhenState, Message, Sourced, Source, DisplayScale };
