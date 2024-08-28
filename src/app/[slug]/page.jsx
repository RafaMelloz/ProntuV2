import { FormSelfEvaluation } from "../../components/formSelfEvaluation";
import { Header } from "../../components/header";

export default function SelfEvaluation({params}){


    return(
        <>
            <Header subtitle={"Autoavaliação Prontuário de Atendimento de Quiropraxia"}/>
            <FormSelfEvaluation />
        </>
    )
}
