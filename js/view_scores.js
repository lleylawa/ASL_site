document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('scores-table-body');
    const noScoresMsg = document.getElementById('no-scores-msg');
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    fetch('http://localhost:3000/api/scores', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            noScoresMsg.style.display = 'block';
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
    
            const dateValue = item.date_submitted;
            const date = dateValue ? new Date(dateValue).toLocaleDateString() : 'N/A';
    
            row.innerHTML = `
                <td>${date}</td>
                <td class="text-capitalize">${item.quiz_type}</td>
                <td><span class="badge ${item.score >= 70 ? 'bg-success' : 'bg-warning text-dark'}">${item.score}%</span></td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(err => {
        console.error('Error fetching scores:', err);
        tableBody.innerHTML = '<tr><td colspan="3" class="text-danger text-center">Failed to load scores.</td></tr>';
    });
});