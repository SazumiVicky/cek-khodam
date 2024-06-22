document.getElementById('khodamForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(this);
  const containerPopup = document.getElementById('container-popup');
  const symbols = ['⣾', '⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽'];
  let symbolIndex = 0;

  const updateSymbol = () => symbols[symbolIndex++ % symbols.length];

  const animateText = (element, text, delay) => {
    return new Promise(resolve => {
      let interval = setInterval(() => {
        element.textContent = text + ' ' + updateSymbol();
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, delay);
    });
  };

  const displayText = (element, text) => {
    element.textContent = text;
    element.classList.add('blur-in');
  };

  const runAnimation = async () => {
    containerPopup.style.display = 'block';
    containerPopup.innerHTML = `
      <div class="analyzing" style="font-family: 'Hack', monospace;">
        <h2>Terminal</h2>
        <p id="step1" class="blur-in">$ detected photo...</p>
        <p id="step2" style="margin-top: 0;"></p>
        <p id="step3" style="margin-top: 0;"></p>
        <p id="step4" style="margin-top: 0;"></p>
      </div>
    `;

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');

    await animateText(step1, '$ detected photo...', 1000);
    displayText(step1, '$ detected photo... complete');

    fetch('/submit', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      step2.classList.add('blur-in');
      step2.textContent = '$ complete uploaded photo';

      step3.classList.add('blur-in');
      step3.textContent = '$ checking your khodam...';
      return animateText(step3, '$ checking your khodam...', 1000);
    })
    .then(() => {
      displayText(step3, '$ checking your khodam... complete');
      return fetch('/submit', {
        method: 'POST',
        body: formData
      });
    })
    .then(response => response.json())
    .then(data => {
      step4.classList.add('blur-in');
      step4.textContent = `$ ${data.khodam}`;
      setTimeout(() => {
        const shareUrl = `${window.location.origin}/share/${data.shareId}`;
        containerPopup.innerHTML = `
          <div class="result" style="font-family: 'Poppins', sans-serif">
            <img src="${data.photoUrl}" alt="Photo" style="max-width: 100%; border-radius: 10px;">
            <h2>Hai ${data.name}</h2>
            <p>Khodam kamu adalah <strong>${data.khodam}</strong></p>
            <div class="share-buttons">
              <button id="facebook-share" class="share-btn"><i class="fab fa-facebook-f"></i></button>
              <button id="instagram-share" class="share-btn"><i class="fab fa-instagram"></i></button>
              <button id="whatsapp-share" class="share-btn"><i class="fab fa-whatsapp"></i></button>
              <button id="copy-link" class="share-btn"><i class="fas fa-link"></i></button>
            </div>
            <p style="color: #333333ad;">Share hasil cek khodam kamu di sosmed</p>
          </div>
        `;
        addShareEventListeners(data.name, data.khodam, shareUrl);
      }, 1000);
    })
    .catch(error => {
      step4.classList.add('blur-in');
      step4.textContent = '$ Upps something went wrong';
    });
  };

  runAnimation();
});

fetch('/total-views')
.then(response => response.json())
.then(data => {
  document.getElementById('total-views').textContent = data.totalViews;
});

document.getElementById('photo').addEventListener('change', function(event) {
  const fileName = event.target.files[0] ? event.target.files[0].name : "Masukin foto kamu";
  document.querySelector('.custom-file-upload').textContent = fileName;
});

function addShareEventListeners(name, khodam, shareUrl) {
  const shareText = `Khodam untuk ${name} adalah ${khodam}`;

  document.getElementById('facebook-share').addEventListener('click', () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
  });

  document.getElementById('instagram-share').addEventListener('click', () => {
    alert('Instagram sharing is not supported via web. Please share manually.');
  });

  document.getElementById('whatsapp-share').addEventListener('click', () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  });

  document.getElementById('copy-link').addEventListener('click', () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
      alert('Link copied to clipboard!');
    });
  });
}
