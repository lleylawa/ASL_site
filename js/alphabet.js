document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('alphabet-container');

    // Генерируем карточки
    aslAlphabet.forEach(item => {
        // Создаем HTML-код для одной карточки
        const cardHtml = `
            <div class="col">
                <div class="card h-100 shadow-sm text-center card-link p-0" 
                     data-letter="${item.letter}" 
                     data-description="${item.description}">
                    
                    <div class="card-body p-0">
                        <img src="${item.image}" class="card-img-top p-3" alt="Sign for ${item.letter}" style="height: 200px; object-fit: contain;">
                        
                        <div class="p-3">
                            <h5 class="card-title display-5 fw-bold">${item.letter}</h5>
                            <p class="card-text description-text text-muted" style="display: none;">
                                ${item.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });

    // 2. ДОБАВЛЯЕМ ОБРАБОТЧИК КЛИКА ДЛЯ ПЕРЕКЛЮЧЕНИЯ ОПИСАНИЯ
    container.addEventListener('click', (event) => {
        const cardElement = event.target.closest('.card-link');

        if (cardElement) {
            // Находим элемент с текстом описания внутри этой карточки
            const descriptionElement = cardElement.querySelector('.description-text');
            
            if (descriptionElement) {
                // Переключаем свойство 'display' с 'none' на 'block' и обратно
                if (descriptionElement.style.display === 'none' || descriptionElement.style.display === '') {
                    descriptionElement.style.display = 'block';
                } else {
                    descriptionElement.style.display = 'none';
                }
            }
        }
    });
});