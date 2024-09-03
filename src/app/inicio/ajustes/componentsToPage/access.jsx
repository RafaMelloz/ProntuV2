"use client"

import { useEffect, useState } from "react";

import { FaPlus } from "react-icons/fa";
import { DefaultUser } from "@/components/defaultUser";
import { isValidEmail } from "@/utils/validations";
import { api } from "@/lib/axios";



export function Access(){


    const submitForm = async (e) => {
        const promise = api.post('/api/accesses', {
            email: "rafaelmeloalvessouza@gmail.com",
        });
    }

    return (
        <section className="w-full !h-full flex">
            <h1 onClick={submitForm}>acesso</h1>
        </section>
    )
}