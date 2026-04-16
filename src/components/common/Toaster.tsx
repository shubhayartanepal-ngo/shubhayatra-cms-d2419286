import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        // Styling for success toasts
        success: {
          style: {
            background: "#22c55e",
            color: "white",
            zIndex: 9999,
          },
          duration: 3000,
        },
        // Styling for error toasts
        error: {
          style: {
            background: "#ef4444",
            color: "white",
            zIndex: 9999,
          },
          duration: 3000,
        },
      }}
    />
  );
}
