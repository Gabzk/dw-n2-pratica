document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    const slider = document.getElementById('lightbox-slider');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    
    // Todos os containers de imagens dos cards
    const cardImages = document.querySelectorAll('.card-image');

    cardImages.forEach(cardImage => {
        cardImage.addEventListener('click', () => {
            const multiImages = cardImage.getAttribute('data-images');
            
            // Limpa o conteúdo atual do slider
            slider.innerHTML = '';

            if (multiImages) {
                // Se o card possuir múltiplas imagens (como o app do Capacitor)
                const imagePaths = multiImages.split(',');
                imagePaths.forEach(path => {
                    const imgElement = document.createElement('img');
                    imgElement.src = path.trim();
                    imgElement.alt = "Tela do Aplicativo";
                    slider.appendChild(imgElement);
                });
                // Exibe as setas de navegação
                prevArrow.style.display = 'flex';
                nextArrow.style.display = 'flex';
            } else {
                // Caso seja um card de imagem única
                const mainImg = cardImage.querySelector('img');
                const imgElement = document.createElement('img');
                imgElement.src = mainImg.src;
                imgElement.alt = mainImg.alt;
                slider.appendChild(imgElement);
                
                // Oculta as setas de navegação
                prevArrow.style.display = 'none';
                nextArrow.style.display = 'none';
            }

            // Exibe o lightbox
            lightbox.style.display = 'flex';
            slider.scrollLeft = 0; // Volta para o primeiro slide
        });
    });

    // Navegação do slider ao clicar nas setas
    prevArrow.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita fechar o lightbox
        slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' });
    });

    nextArrow.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita fechar o lightbox
        slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
    });

    // Função para fechar o lightbox
    const closeLightbox = () => {
        lightbox.style.display = 'none';
        slider.innerHTML = '';
    };

    closeBtn.addEventListener('click', closeLightbox);
    
    // Fecha clicando no fundo (fora do slider e das setas)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Fecha pressionando Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
});
