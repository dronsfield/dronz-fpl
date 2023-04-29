import { AriaModalOverlayProps, Overlay, useModalOverlay } from "react-aria";
import React from "react";
import { OverlayTriggerState } from "react-stately";

interface ModalProps extends AriaModalOverlayProps {
  state: OverlayTriggerState;
  children?: React.ReactNode;
}

export function Modal(props: ModalProps) {
  const { state, children, ...rest } = props;
  let ref = React.useRef(null);
  let { modalProps, underlayProps } = useModalOverlay(rest, state, ref);

  return (
    <Overlay>
      <div
        style={{
          position: "fixed",
          zIndex: 100,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        {...underlayProps}
      >
        <div
          {...modalProps}
          ref={ref}
          style={{
            background: "white",
          }}
        >
          {children}
        </div>
      </div>
    </Overlay>
  );
}
