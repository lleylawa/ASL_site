document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('words-container');

    // Use the new basicWords array from asl_data.js
    basicWords.forEach(item => {
        const cardHtml = `
            <div class="col">
                <div class="card h-100 shadow-sm text-center">
                    <img src="${item.image}" class="card-img-top p-3" alt="Sign for ${item.word}" style="height: 200px; object-fit: contain;">
                    <div class="card-body">
                        <h5 class="card-title display-5 fw-bold">${item.word}</h5>
                        <p class="card-text text-muted">${item.description}</p>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
});