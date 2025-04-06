/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // Diğer çevre değişkenlerini buraya ekleyebilirsiniz
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }