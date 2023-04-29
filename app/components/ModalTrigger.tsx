import {
  AriaButtonProps,
  useOverlayTrigger,
  AriaModalOverlayProps,
} from "react-aria";
import { OverlayTriggerProps, useOverlayTriggerState } from "react-stately";
import React from "react";
import Button from "./Button";
import { Modal } from "./Modal";

type ModalTriggerProps = (OverlayTriggerProps & AriaModalOverlayProps) & {
  label: string;
  renderModal: (close: () => void) => React.ReactElement;
  renderTrigger: (
    props: AriaButtonProps<"button"> & {
      onClick: AriaButtonProps<"button">["onPress"];
    }
  ) => React.ReactElement;
};

export function ModalTrigger(props: ModalTriggerProps) {
  const { label, renderModal, renderTrigger, ...rest } = props;
  let state = useOverlayTriggerState(rest);
  let { triggerProps, overlayProps } = useOverlayTrigger(
    { type: "dialog" },
    state
  );
  console.log({ triggerProps });

  return (
    <>
      {renderTrigger({ ...triggerProps, onClick: triggerProps.onPress })}
      {state.isOpen && (
        <Modal {...props} state={state}>
          {React.cloneElement(renderModal(state.close), overlayProps)}
        </Modal>
      )}
    </>
  );
}
