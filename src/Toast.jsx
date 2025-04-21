import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const handleResponse = (response) => {
  const toastConfig = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  const ToastContent = () => (
    <div className="toast-content">
      <h4>{response.title}</h4>
      <p>{response.message}</p>
      <span className="response-icon">{response.icon}</span>
    </div>
  );

  if (response.status === 'success') {
    toast.success(<ToastContent />, toastConfig);
  } else {
    toast.error(<ToastContent />, toastConfig);
  }
};

export const showSuccessToast = (title, message, icon = '✅') => {
  handleResponse({
    status: 'success',
    title,
    message,
    icon
  });
};

export const showErrorToast = (title, message, icon = '❌') => {
  handleResponse({
    status: 'error',
    title,
    message,
    icon
  });
};