import { toast } from "sonner";

const infoToast = (
  title: string,
  description?: string,
  duration: number = 5000,
  onClose?: () => void,
  onClick?: () => void,
  onDismiss?: () => void
) => {
  toast.info(title, {
    description,
    duration,
    style: {
      backgroundColor: "#1e293b",
      color: "#f8fafc",
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

export default infoToast;
