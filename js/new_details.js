// document.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('enableInputsButton').addEventListener('click', function() {
//         var inputs = document.querySelectorAll('#modificationForm input[type="text"]');
//         for (var i = 0; i < inputs.length; i++) {
//             inputs[i].removeAttribute('disabled');
//         }
//         document.getElementById('saveChangesButton').style.display = 'block';
//     });
// });

// document.getElementById('modificationForm').addEventListener('submit', function(event) {
//     event.preventDefault();

//     var formData = new FormData(this);
//     var xhr = new XMLHttpRequest();
//     xhr.open('POST', '../pages/script/script_new_details.php.php', true);

//     xhr.onload = function() {
//         if (xhr.status === 200) {
//             alert('Modifications enregistrées');
//         } else {
//             alert("Erreur lors de l'enregistrement");
//         }
//     };

//     xhr.send(formData);
// });
