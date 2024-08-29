import toast from "react-hot-toast";

export const loadingAlert = (msgLoading, promise) => {
    toast.promise(promise,
        {
            loading: msgLoading,
            success: (data) => data.message,
            error: (err) => err.response.data.message,
        },
        {
            position: 'top-right'
        }
    );
}

export const successAlert = (msgSuccess) => {
    toast.success(msgSuccess, {
        duration: 1500,
        position: 'top-right',
    });
};

export const errorAlert = (msgSuccess) => {
    toast.error(msgSuccess, {
        duration: 1700,
        position: 'top-right',
    });
};

