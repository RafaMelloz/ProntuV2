import { Tailwind } from "@react-email/tailwind";

export const PasswordEmail = (name, token, dateLocal) => {
    const formattedDate = dateLocal.toLocaleString("pt-BR", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Tailwind
            config={{
                theme: {
                    extend: {
                        colors: {
                            primary: "#5a9cda",
                        },
                    },
                },
            }}
        >

            <div className="m-auto max-w-lg w-full border border-zinc-500">
                <h1 className="text-3xl font-semibold text-primary text-center capitalize">
                    Olá {name}
                </h1>
                <p className="text-base text-gray-600">
                    Recebemos uma solicitação para redefinir a senha da sua conta no dia {formattedDate}
                </p>
                <p className="text-base text-gray-600">
                    Se você não solicitou a redefinição da senha, ignore este e-mail. Caso contrário, use o código abaixo para redefinir sua senha:
                </p>

                <p className="bg-primary/10 text-primary font-semibold p-2  w-32 block m-auto tracking-widest text-xl text-center">
                    {token}
                </p>
                <img className="block mx-auto my-3 w-full mt-10" src="https://prontue.com/assets/footerEmail-BL6YmNQn.png" alt=""/>
            </div>
        </Tailwind>
    );
};
