import { FaHospital, FaUser } from "react-icons/fa";

export function DefaultUser({ clinic }) {
    return (
        <div className="w-12 h-12 bg-gray-300 dark:bg-dark-600 rounded-full flex justify-center items-center">
            {clinic
                ? <FaHospital className="text-gray-400 text-2xl" />
                : <FaUser className="text-gray-400 text-2xl" />
            }
        </div>
    )
}