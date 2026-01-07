export const environment = {
  name: 'local',
  envColor: '#ff9800',
  production: false,
  devAccessKey: 'fp',
  apiBaseUrl: 'http://localhost:8080',
  redsysUrl: 'https://sis-t.redsys.es:25443/sis/realizarPago', // test URL
  merchantCode: '123456789', // your test merchant code
  terminal: '1',
  secretKey: 'TEST_KEY', // test secret key
  urlOK: 'http://localhost:4200/payment-success', // local success page
  urlKO: 'http://localhost:4200/payment-failed',  // local failed page
  merchantURL: 'http://localhost:4200/api/payments/notification' // backend notification URL
};