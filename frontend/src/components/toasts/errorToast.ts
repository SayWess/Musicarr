import { toast } from "sonner";

interface ErrorToastProps {
  title: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  onClick?: () => void;
  onDismiss?: () => void;
}

const errorToast = ({
  title,
  description,
  duration = 5000,
  onClose,
  onClick,
  onDismiss,
}: ErrorToastProps) => {
//   const handleClick = () => {
//     if (onClick) onClick();
//     if (onClose) onClose();
//   };

//   const handleDismiss = () => {
//     if (onDismiss) onDismiss();
//   };

  toast.error(title, {
    description: description,
    duration: duration,
    style: {
        backgroundColor: "#F44336",
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: "16px",
    },
    // action: {
    //   label: "Close",
    //   onClick: handleClick,
    // },
    // onDismiss: handleDismiss,
  });
};

export default errorToast;