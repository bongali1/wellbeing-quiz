(function () {
  const form = document.getElementById('quizForm');
  const resultBlock = document.getElementById('resultBlock');
  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');
  const helpContacts = document.getElementById('helpContacts');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const submitBtn = document.getElementById('submitBtn');
  const submitResultBtn = document.getElementById('submitResultBtn');

  function getValue(name) {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? parseInt(el.value, 10) : null;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Analyse en cours...';

    setTimeout(() => {
      const totalQuestions = 9;
      let score = 0;
      let suicidalRisk = 0;

      for (let i = 1; i <= totalQuestions; i++) {
        const val = getValue('q' + i);
        if (val === null) {
          alert('Veuillez répondre à toutes les questions.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Analyser mes résultats';
          return;
        }
        score += val;
      }

      suicidalRisk = getValue('q9');

      resultBlock.style.display = 'block';

      // PHQ-9 Scoring
      let category = '';
      let recommendation = '';
      if (score >= 20) {
        category = 'Dépression sévère';
        recommendation = 'Une consultation psychiatrique urgente est fortement recommandée.';
      } else if (score >= 15) {
        category = 'Dépression modérément sévère';
        recommendation = 'Consultez rapidement un psychiatre ou un psychologue.';
      } else if (score >= 10) {
        category = 'Dépression modérée';
        recommendation = 'Un suivi professionnel est conseillé.';
      } else if (score >= 5) {
        category = 'Dépression légère';
        recommendation = 'Surveillez votre santé mentale et consultez si aggravation.';
      } else {
        category = 'Minimal ou pas de dépression';
        recommendation = 'Continuez à prendre soin de vous.';
      }

      if (suicidalRisk >= 1 || score >= 15) {
        resultBlock.className = 'result-section need-help';
        resultTitle.textContent = '⚠️ Votre bien-être nécessite une attention immédiate';
        resultTitle.style.color = '#b91c1c';
        resultText.innerHTML = `<strong>${category}</strong><br/>${recommendation}<br/><br/>Il est important de chercher du soutien professionnel dès maintenant.`;
        helpContacts.style.display = 'block';
        submitResultBtn.style.display = 'inline-block';
      } else if (score >= 5) {
        resultBlock.className = 'result-section need-help';
        resultTitle.textContent = 'Nous vous recommandons du soutien';
        resultTitle.style.color = '#b91c1c';
        resultText.innerHTML = `<strong>${category}</strong><br/>${recommendation}`;
        helpContacts.style.display = 'none';
        submitResultBtn.style.display = 'inline-block';
      } else {
        resultBlock.className = 'result-section all-good';
        resultTitle.textContent = '✅ Votre bien-être semble stable';
        resultTitle.style.color = '#15803d';
        resultText.innerHTML = `<strong>${category}</strong><br/>Continuez à prendre soin de vous et n'hésitez pas à chercher du soutien si cela change.`;
        helpContacts.style.display = 'none';
        submitResultBtn.style.display = 'none';
      }

      scoreDisplay.innerHTML = `Score PHQ-9 : <strong>${score}/27</strong> (${category})`;

      resultBlock.focus({ preventScroll: true });
      resultBlock.scrollIntoView({ behavior: 'smooth' });

      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Analyser mes résultats';
    }, 800);
  });

  submitResultBtn.addEventListener('click', function () {
    submitResultBtn.disabled = true;
    submitResultBtn.innerHTML = '<span class="loading"></span> Envoi...';

    const responses = [];
    for (let i = 1; i <= 9; i++) {
      responses.push(getValue('q' + i));
    }

    fetch('/api/submit-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses, timestamp: new Date().toISOString() })
    })
      .then(r => r.json())
      .then(data => {
        alert('✅ Vos résultats ont été envoyés à un professionnel de santé. Vous serez contacté(e) dans 24h.');
        submitResultBtn.disabled = false;
        submitResultBtn.innerHTML = '📤 Envoyer';
      })
      .catch(err => {
        console.error(err);
        alert('❌ Erreur lors de l\'envoi. Veuillez réessayer ou contacter directement un professionnel.');
        submitResultBtn.disabled = false;
        submitResultBtn.innerHTML = '📤 Envoyer';
      });
  });
})();
