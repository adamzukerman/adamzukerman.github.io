// Load About Me text
fetch('src/text/about_harmony_project.txt')
    .then(response => response.text())
    .then(data => {
        document.getElementById('harmony-project-description').innerText = data;
    })
    .catch(error => console.error('Error loading text:', error));
