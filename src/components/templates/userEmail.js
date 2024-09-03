export function generateEmailTemplate(name, nameClinic, codeClinic, email, password) {
    return `
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap');
                *{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body{
                    font-family: 'Poppins', sans-serif;
                }

                .logoProntu{
                    width: 100%
                }

                .textXL{
                    text-align: center;
                    font-size: 1.5rem;
                    color: #5A9CDA;
                }

                .textLg{
                    text-align: center;
                    font-size: 1.2rem;
                }

                .content{
                    width: fit-content;
                    display: flex;
                    margin: 40px auto;
                    padding: 0 20px;
                }

                .content div{
                    flex: 1;
                    margin: 0 1%;
                }

                @media (max-width: 600px) {
                    .content {
                        display: block;
                    }

                    .content div {
                        width: 100%;
                        margin-bottom: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div>
                <img class="logoProntu" src="https://prontue.com/assets/banner-C3vPZyId.jpg" alt="Logo ProntuEPonto">
                <div>
                    <h2 class="textXL" style="padding: 30px 20px;">Olá ${name}</h2>
                    <p class="textLg" style="text-align: center;">Seja bem-vindo(a) ao Prontu e Ponto</p>
                    <p class="textLg" style="text-align: center;">verifique abaixo suas informações:</p>
                </div>

                <div class="content">
                    <div>
                        <h3 style="color: #5A9CDA; margin-bottom: 10px;">Acesso da clinica:</h3>
                        <div style="background-color: #F4F9FD; padding: 20px; font-weight: 600; min-width:289px; min-height:98.5px">
                            <p>Clinica: <span style="color:#5A9CDA">${nameClinic}</span></p>
                            <p>Código da clinica: <span style="color:#5A9CDA">${codeClinic}</span></p>
                        </div>
                    </div>

                    <div>
                        <h3 style="color: #5A9CDA; margin-bottom: 10px;">Acesso do colaborador:</h3>
                        <div style="background-color: #F4F9FD; padding: 20px; font-weight: 600; min-width:289px; min-height:98.5px">
                            <p>Usuário: <span style="color:#5A9CDA">${email}</span></p>
                            <p>Código da clinica: <span style="color:#5A9CDA">${codeClinic}</span></p>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin: 10px 0px 50px 0px;">
                    <span style="font-size: 1rem;">Esta é sua nova senha para o primeiro acesso:</span>
                    <h2 class="textXL" style="padding: 20px;">${password}</h2>
                    <span style="font-size: 1rem;">Para sua segurança, recomendamos que faça a troca da senha padrão após fazer o login.</span>
                </div>

                <a style="width: 100%; max-width: 210px; border-radius: 30px; background-color: #5A9CDA; color: white; text-align: center; padding: 10px 0; display: block; margin: auto; text-decoration: none;" href="https://prontu.vercel.app/login">Acessar agora</a>

                <div style="margin: 40px 0;">
                    <p class="textLg" style="text-align: center;">Qualquer dúvida fale com a gente por</p>
                    <p class="textLg" style="text-align: center;">contato@prontue.com</p>
                </div>
            </div>
            <img style="margin: 0 auto; display: block;" src="	https://prontue.com/assets/footerEmail-BL6YmNQn.png" alt="">
        </body>
        </html>
    `;
}