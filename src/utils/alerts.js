import toast from "react-hot-toast";
import { LuCheck, LuX } from "react-icons/lu";

export const loadingAlert = (msgLoading, promise) => {
    toast.promise(promise,
        {
            loading: msgLoading,
            success: (data) => data.data.message,
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

export const confirmAlert = (msg, confirmFunction) => {
    toast((t) => (
        <div>
            <p>{msg}</p>

            <div className="flex justify-between gap-2 mt-5">
                <button className="text-white bg-vermelho-900 rounded w-full flex justify-center items-center" onClick={() => toast.dismiss(t.id)}>
                    <LuX size={22} />
                </button>

                <button className="text-white bg-verde-900 rounded w-full flex justify-center items-center" onClick={() => {
                    confirmFunction(); // Executa a função de confirmação
                    toast.dismiss(t.id); // Fecha o alerta
                }}>
                    <LuCheck  size={22}/>
                </button>
            </div>
        </div>
    ),
        {
            position: 'top-right',
            duration: 5000
        }
    );
};
