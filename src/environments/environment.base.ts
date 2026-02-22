export const baseEnvironment = {
  name: 'default',
  production: false,
  envColor: '#ff9800',
  launchDate: "2026-05-15T16:40:35",
  apiBaseUrl: 'https://forestplusapp.com',
  redsysUrl: 'https://sis.redsys.es/sis/realizarPago', // production URL
  merchantCode: '987654321', // production merchant code
  terminal: '1',
  secretKey: 'PROD_KEY', // production secret key
  urlOK: 'https://forestplusapp.com/payment-success', // production success page
  urlKO: 'https://forestplusapp.com/payment-failed', // production failed page
  merchantURL: 'https://forestplusapp.com/api/payments/notification' // production backend notification URL
};