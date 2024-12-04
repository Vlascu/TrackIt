async function getUserIdFromSession() {
    const response = await fetch('http://localhost:8080/user/sessionId', {
        method : 'GET'
    } );

    const result = await response.json();

    if (response.ok) {
        document.getElementById('user-id').innerText = 'User id: ' + result.userId;
    } else {
        alert('Couldn\'t get current user id: ' + result.error);
    }
}

// window.onload = () => {
//     getUserIdFromSession().catch(error => {
//         console.error('Error in onload:', error);
//     });
// };
