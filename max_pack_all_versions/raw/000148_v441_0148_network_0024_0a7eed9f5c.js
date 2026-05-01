let selector = document.getElementById('language-selector');
if (selector) {

  selector.addEventListener('click', function () {
    toggleSelector(selector);
  });
}

function toggleSelector(selector) {
  selector.classList.contains('show') ? selector.classList.remove('show') : selector.classList.add('show');
}
