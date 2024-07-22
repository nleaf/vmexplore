async function recordSelection(selection) {
    try {
        const response = await fetch('/api/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selection })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error recording selection:', error);
    }
}

async function fetchResults() {
    try {
        const response = await fetch('/api/results');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching results:', error);
    }
}

function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('visible');
    });
    document.getElementById(screenId).classList.remove('hidden');
    document.getElementById(screenId).classList.add('visible');
    updateResults();
}

async function handleSelection(selection) {
    await recordSelection(selection);
    navigateTo(`screen${selection}`);
}

async function updateResults() {
    const results = await fetchResults();
    document.getElementById('graph').innerHTML = `
        <div>Alternate Hypervisor: ${results.hypervisor}</div>
        <div>VCF Bundle FTW!: ${results.vmware}</div>
        <div>All in on Hyperscale: ${results.hyperscaler}</div>
    `;
}

document.getElementById('expertForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    alert(`Form submitted with email: ${email}`);
    // Here you can handle the form submission, e.g., sending data to the server
    navigateTo('home'); // Navigate back to home after submission
});

// Initialize home screen visibility and load selections
document.getElementById('home').classList.add('visible');
updateResults();
