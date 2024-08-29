"use client"

import { useEffect, useRef, useState } from 'react';
import pngImage from '@/../public/assets/corpohumano.png';
import jpgBackground from '@/../public/assets/careca.jpg';
import { FaCheck, FaTrash } from 'react-icons/fa';
import { successAlert } from '@/utils/alerts';

export function UncomfortableAreas({ setFormData }) {
    const tela = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const pngRef = useRef(new Image());
    const jpgRef = useRef(new Image());
    const pincel = useRef({
        ativo: false,
        movendo: false,
        pos: { x: 0, y: 0 },
        posAnterior: null,
    });

    useEffect(() => {
        // Carrega as imagens
        pngRef.current.src = pngImage.src;
        jpgRef.current.src = jpgBackground.src;

        const handleImageLoad = () => {
            if (pngRef.current.complete && jpgRef.current.complete) {
                setImagesLoaded(true);
                adjustCanvas();
            }
        };

        pngRef.current.onload = handleImageLoad;
        jpgRef.current.onload = handleImageLoad;

        const adjustCanvas = () => {
            const canvas = tela.current;
            const contexto = canvas.getContext("2d");
            const proposition = 500 / 425; // Proporção da imagem original
            const width = Math.min(window.innerWidth, 500);
            const height = width / proposition;

            canvas.width = width;
            canvas.height = height;

            contexto.lineWidth = 12 * (width / 500);
            contexto.strokeStyle = "rgba(218, 28, 28, 0.5)";

            // Desenha o fundo da imagem PNG
            contexto.drawImage(pngRef.current, 0, 0, canvas.width, canvas.height);
        };

        if (imagesLoaded) {
            window.addEventListener('resize', adjustCanvas);
            adjustCanvas();

            const canvas = tela.current;
            const contexto = canvas.getContext("2d");

            const drawLine = (linha) => {
                contexto.beginPath();
                contexto.moveTo(linha.posAnterior.x, linha.posAnterior.y);
                contexto.lineTo(linha.pos.x, linha.pos.y);
                contexto.stroke();
            };

            const getPosition = (event) => {
                const rect = canvas.getBoundingClientRect();
                const escalaX = canvas.width / rect.width;
                const escalaY = canvas.height / rect.height;
                const x = (event.clientX || event.touches[0].clientX) - rect.left;
                const y = (event.clientY || event.touches[0].clientY) - rect.top;
                return {
                    x: x * escalaX,
                    y: y * escalaY,
                };
            };

            const startDrawing = (event) => {
                event.preventDefault();
                pincel.current.ativo = true;
                pincel.current.posAnterior = getPosition(event);
            };

            const finalizeDrawing = (event) => {
                event.preventDefault();
                pincel.current.ativo = false;
            };

            const moveDrawing = (event) => {
                event.preventDefault();
                if (pincel.current.ativo) {
                    pincel.current.pos = getPosition(event);
                    drawLine({ pos: pincel.current.pos, posAnterior: pincel.current.posAnterior });
                    pincel.current.posAnterior = { ...pincel.current.pos };
                }
            };

            // Eventos de mouse
            canvas.onmousedown = startDrawing;
            canvas.onmouseup = finalizeDrawing;
            canvas.onmousemove = moveDrawing;
            canvas.onmouseout = finalizeDrawing;

            // Eventos de toque
            canvas.ontouchstart = startDrawing;
            canvas.ontouchend = finalizeDrawing;
            canvas.ontouchmove = moveDrawing;
            canvas.ontouchcancel = finalizeDrawing;
        }

        return () => {
            window.removeEventListener('resize', adjustCanvas);
        };
    }, [imagesLoaded]);

    const limparCanvas = (event) => {
        event.preventDefault();
        const canvas = tela.current;
        const contexto = canvas.getContext("2d");
        contexto.clearRect(0, 0, canvas.width, canvas.height);
        if (imagesLoaded) {
            contexto.drawImage(pngRef.current, 0, 0, canvas.width, canvas.height);
        }
    };

    const captureScreenshot = (event) => {
        event.preventDefault();
        const canvas = tela.current;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width / 2;
        tempCanvas.height = canvas.height / 2;
        const tempContext = tempCanvas.getContext("2d");

        if (imagesLoaded) {
            // Desenha o fundo JPG
            tempContext.drawImage(jpgRef.current, 0, 0, tempCanvas.width, tempCanvas.height);

            // Desenha o canvas atual (incluindo a imagem PNG e os desenhos)
            tempContext.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

            // Salva o resultado final como JPG
            tempCanvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    console.log(url, blob);

                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        uncomfortableAreas: {
                            ...prevFormData.uncomfortableAreas,
                            blob: blob, // Armazena o Blob da imagem
                        },
                    }));

                    successAlert("Captura feita com sucesso!");
                }
            }, "image/jpeg", 1);
        }
    };

    return (
        <div className="m-auto">
            <h2 className='text-center font-medium mb-4 text-xl md:text-2xl textSwitch'>Marque as áreas de desconforto na imagem abaixo <span className="text-vermelho-900 font-bold">*</span></h2>

            <div className="flex flex-col items-center">
                <canvas ref={tela} className='w-full h-full max-w-[500px] max-h-[400px] dark:invert'></canvas>

                <div className='flex gap-10 md:gap-48 mt-5'>
                    <button className="text-white font-semibold  hover:bg-vermelho-900/60 bg-vermelho-900 p-2 rounded-md flex items-center  w-full gap-2 min-w-28 justify-center" onClick={limparCanvas}>
                        <FaTrash />
                        <span>Desfazer</span>
                    </button>

                    <button className="text-white font-semibold  hover:bg-verde-900/60 bg-verde-900 p-2 rounded-md flex items-center w-full gap-2 min-w-28 justify-center" onClick={captureScreenshot}>
                        <FaCheck />
                        <span>Salvar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
