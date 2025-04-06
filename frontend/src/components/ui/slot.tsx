import * as React from "react"

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (!children) {
      return null
    }

    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ...children.props,
        ref: ref ? ref : children.props.ref,
      })
    }

    console.error(
      "Slot component expects a single ReactElement child."
    )
    return null
  }
)
Slot.displayName = "Slot"

export { Slot }