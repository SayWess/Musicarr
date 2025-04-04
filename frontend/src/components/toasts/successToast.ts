import { toast } from "sonner";

interface SuccessToastProps {
  title: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  onClick?: () => void;
  onDismiss?: () => void;
}
const successToast = ({
  title,
  description,
  duration = 5000,
  onClose,
  onClick,
  onDismiss,
}: SuccessToastProps) => {
//   const handleClick = () => {
//     if (onClick) onClick();
//     if (onClose) onClose();
//   };

//   const handleDismiss = () => {
//     if (onDismiss) onDismiss();
//   };

  toast.success(
    title,
    {
        style: {
            backgroundColor: "#4CAF50",
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: "16px",
        },
    }
  );
};

export default successToast;