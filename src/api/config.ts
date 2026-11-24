// URL base para o serviço de visão computacional (CV) que roda no PC. O celular se comunica com ele via rede local.
//export const API_BASE_URL = 'http://192.168.1.100:8001/api';

const LOCAL_API_URL = 'http://127.0.0.1:8001/api';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? LOCAL_API_URL;
