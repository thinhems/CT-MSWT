import { useEffect } from "react";
import {
  HiCheckCircle,
  HiXCircle,
  HiInformationCircle,
  HiX,
} from "react-icons/hi";
import styles from "./Notification.module.css";

const Notification = ({
  type = "success",
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <HiCheckCircle className={styles.iconSuccess} />;
      case "error":
        return <HiXCircle className={styles.iconError} />;
      case "info":
        return <HiInformationCircle className={styles.iconInfo} />;
      default:
        return <HiCheckCircle className={styles.iconSuccess} />;
    }
  };

  const getNotificationClass = () => {
    switch (type) {
      case "success":
        return styles.notificationSuccess;
      case "error":
        return styles.notificationError;
      case "info":
        return styles.notificationInfo;
      default:
        return styles.notificationSuccess;
    }
  };

  return (
    <div className={`${styles.notification} ${getNotificationClass()}`}>
      <div className={styles.notificationContent}>
        {getIcon()}
        <span className={styles.message}>{message}</span>
      </div>
      <button
        onClick={onClose}
        className={styles.closeButton}
        aria-label="Close notification"
      >
        <HiX className={styles.closeIcon} />
      </button>
    </div>
  );
};

export default Notification;
