(function () {
  const locateBtn = document.getElementById('locateBtn');
  const locationStatus = document.getElementById('locationStatus');
  const meetinghouseResults = document.getElementById('meetinghouseResults');
  const meetinghouseList = document.getElementById('meetinghouseList');
  const noLocationMessage = document.getElementById('noLocationMessage');

  // Sample LDS meetinghouses data (in production, this would come from an API)
  const sampleMeetinghouses = [
    {
      name: 'Paris Stake Center',
      address: '123 Rue de Rivoli, 75001 Paris, France',
      lat: 48.8566,
      lng: 2.3522,
      phone: '+33 1 23 45 67 89',
      services: 'Sunday: 10:00 AM, Wednesday: 7:00 PM'
    },
    {
      name: 'Lyon Ward',
      address: '456 Rue de la Paix, 69000 Lyon, France',
      lat: 45.7640,
      lng: 4.8357,
      phone: '+33 4 87 65 43 21',
      services: 'Sunday: 9:00 AM, Friday: 6:30 PM'
    },
    {
      name: 'Marseille Branch',
      address: '789 Boulevard Longchamp, 13004 Marseille, France',
      lat: 43.2965,
      lng: 5.3698,
      phone: '+33 4 91 54 32 10',
      services: 'Sunday: 11:00 AM, Thursday: 7:00 PM'
    },
    {
      name: 'Kinshasa Stake',
      address: 'Avenue de l\'Indépendance, Kinshasa, DRC',
      lat: -4.3276,
      lng: 15.3136,
      phone: '+243 1 234 567 89',
      services: 'Sunday: 9:00 AM, Saturday: 6:00 PM'
    },
    {
      name: 'New York Manhattan',
      address: '1250 Broadway, New York, NY 10001, USA',
      lat: 40.7481,
      lng: -73.9869,
      phone: '+1 (212) 555-0100',
      services: 'Sunday: 10:00 AM & 12:00 PM, Wednesday: 7:00 PM'
    }
  ];

  function calculateDistance(lat1, lng1, lat2, lng2) {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function displayStatus(message, type) {
    locationStatus.style.display = 'block';
    locationStatus.className = type;
    locationStatus.textContent = message;
  }

  function displayMeetinghouses(userLat, userLng) {
    // Calculate distances and sort
    const nearby = sampleMeetinghouses
      .map(mh => ({
        ...mh,
        distance: calculateDistance(userLat, userLng, mh.lat, mh.lng)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Show top 10 nearest

    meetinghouseList.innerHTML = '';
    nearby.forEach(mh => {
      const card = document.createElement('div');
      card.className = 'meetinghouse-card';
      card.innerHTML = `
        <div class="meetinghouse-name">${mh.name}</div>
        <div class="meetinghouse-address">${mh.address}</div>
        <div class="meetinghouse-distance">📍 ${mh.distance.toFixed(1)} km away</div>
        <div class="meetinghouse-actions">
          <button onclick="window.open('https://www.google.com/maps/?q=${encodeURIComponent(mh.address)}', '_blank')">🗺️ Map</button>
          <button onclick="window.open('tel:${mh.phone}')">📞 Call</button>
        </div>
      `;
      meetinghouseList.appendChild(card);
    });

    meetinghouseResults.style.display = 'block';
    displayStatus('✅ Église(s) trouvée(s) à proximité!', 'success');
  }

  locateBtn.addEventListener('click', function () {
    locateBtn.disabled = true;
    displayStatus('📍 Obtention de votre localisation...', 'loading');
    meetinghouseResults.style.display = 'none';
    noLocationMessage.style.display = 'none';

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const { latitude, longitude } = position.coords;
          displayMeetinghouses(latitude, longitude);
          locateBtn.disabled = false;
        },
        function (error) {
          console.error('Geolocation error:', error);
          displayStatus('❌ Impossible d\'obtenir votre localisation', 'error');
          noLocationMessage.style.display = 'block';
          locateBtn.disabled = false;
        }
      );
    } else {
      displayStatus('❌ La géolocalisation n\'est pas supportée par votre navigateur', 'error');
      noLocationMessage.style.display = 'block';
      locateBtn.disabled = false;
    }
  });
})();
