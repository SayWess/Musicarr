import { toast } from "sonner";

const errorToast = (
  title: string,
  description?: string,
  duration: number = 5000,
  onClose?: () => void,
  onClick?: () => void,
  onDismiss?: () => void
) => {
  toast.error(title, {
    description,
    duration,
    style: {
      backgroundColor: "#730400",
      color: "#FFFFFF",
    },
    // If you want to support onClick/onClose/onDismiss again later, re-add this logic:
    // action: onClick || onClose ? {
    //   label: "Close",
    //   onClick: () => {
    //     onClick?.();
    //     onClose?.();
    //   }
    // } : undefined,
    // onDismiss: onDismiss,
  });
};

export default errorToast;
