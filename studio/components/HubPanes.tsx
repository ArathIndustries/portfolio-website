import { useEffect } from "react";
import { useGetPuck } from "@puckeditor/core";
import { asHubPane, onHubMessage } from "../hubBridge";
import { usePhone } from "./PhoneSheet";

/**
 * Handles the hub's `hub-show-pane` message (hubBridge.ts) from inside Puck, where
 * the UI state lives: `blocks`, `outline` and `pages` pick that tab of the left
 * sidebar and show it; `fields` shows the right sidebar on the desktop and the
 * Fields sheet on the phone (as a tap on a block does, PhoneSheet.tsx); `null`
 * hides both sidebars on the desktop and closes the sheet on the phone. Rendered
 * from the header override, like PhoneSheet, so it mounts with each page.
 */
export function HubPanes() {
  const phone = usePhone();
  const getPuck = useGetPuck();

  useEffect(
    () =>
      onHubMessage((message) => {
        if (message.type !== "hub-show-pane") return;
        const setUi = (ui: Record<string, unknown>) => getPuck().dispatch({ type: "setUi", ui } as never);
        const pane = asHubPane(message.pane);
        if (!pane) {
          setUi(phone ? { leftSideBarVisible: false, mobilePanelExpanded: false } : { leftSideBarVisible: false, rightSideBarVisible: false });
          return;
        }
        if (pane === "fields" && !phone) {
          setUi({ rightSideBarVisible: true });
          return;
        }
        setUi({ plugin: { current: pane }, leftSideBarVisible: true });
      }),
    [phone, getPuck],
  );

  return null;
}
