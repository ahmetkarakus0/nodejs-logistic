var twoFactorCode = '';
var tempToken = '';

const get2FACode = async () => {
  const request = await fetch('/api/v1/auth/two-factor-auth', {
    method: 'POST',
    body: JSON.stringify({
      phone: '+905079026718',
      password: 'adminadmin',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await request.json();
  await window.ui.preauthorizeApiKey('tempTokenHeader', data.tempToken);
  tempToken = data.tempToken;
  twoFactorCode = data.code;
};

const verify2FACode = async () => {
  const request = await fetch('/api/v1/auth/verify-two-factor-code', {
    method: 'POST',
    body: JSON.stringify({
      code: twoFactorCode,
    }),
    headers: {
      'Content-Type': 'application/json',
      tempToken,
    },
  });
  const data = await request.json();
  window.ui.preauthorizeApiKey('bearerAuth', `Bearer ${data.accessToken}`);
  await window.ui.preauthorizeApiKey('refreshTokenHeader', data.refreshToken);
};

const createButton = () => {
  const automationButton = document.createElement('button');
  automationButton.textContent = 'Fast Login';
  automationButton.style.position = 'fixed';
  automationButton.style.bottom = '20px';
  automationButton.style.right = '20px';
  automationButton.style.zIndex = '1000';
  automationButton.style.backgroundColor = '#007bff';
  automationButton.style.color = '#fff';
  automationButton.style.padding = '10px 20px';
  automationButton.style.borderRadius = '5px';
  automationButton.style.cursor = 'pointer';
  automationButton.addEventListener('click', () => {
    get2FACode()
      .then(() => verify2FACode())
      .then(() => {
        alert('Login successful');
      });
  });
  document.body.appendChild(automationButton);
};

setTimeout(() => {
  createButton();
}, 1000);
