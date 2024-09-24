import NextAuth from "next-auth"
import prisma from "./prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session:{
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                codeClinic: { label: "Clinic Code", type: "text" },
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials.email || !credentials.password || !credentials.codeClinic) {
                    return null;
                }

                const existingClinic = await prisma.clinic.findFirst({
                    where: { codeClinic: credentials.codeClinic }
                });

                const existingUser = await prisma.user.findFirst({
                    where: { email: credentials.email }
                });

                if (!existingClinic || !existingUser) {
                    throw new Error("Credenciais Inválidas!");
                }

                const pwMatch = await compare(credentials.password, existingUser.password);

                if (!pwMatch) {
                    throw new Error("Credenciais Inválidas!");
                }

                return {
                    id: existingUser.idUser,
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role,
                    img: existingUser.profileImg,
                    clinic: {
                        id: existingClinic.idClinic,
                        codeClinic: existingClinic.codeClinic,
                        nameClinic: existingClinic.nameClinic,
                        logoClinic: existingClinic.logoClinic,
                        slug: existingClinic.clinicSlug,

                        stripeSubscriptionId: existingClinic.stripeSubscriptionId,
                        stripeSubscriptionStatus: existingClinic.stripeSubscriptionStatus,
                        stripePriceId: existingClinic.stripePriceId,
                    }
                };
            }
        })
    ],
    callbacks:{
        async jwt({ token, user, trigger, session }) {

            if (trigger === 'update') {
                token.name = session.name;
                token.email = session.email;
                token.img = session.img;
                token.clinic.nameClinic = session.clinic.nameClinic;
                token.clinic.logoClinic = session.clinic.logoClinic;
            }

            if (user) {
                return {
                    ...token,
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    img: user.img,
                    clinic: user.clinic,
                }
            }

            return token
        },
        async session({ session, token }) {
            return{
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    name: token.name,
                    email: token.email,
                    role: token.role,
                    img: token.img,
                    clinic: token.clinic
                }
                
            }
        }
    }
            
}
