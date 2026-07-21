import { Cloudinary } from "@cloudinary/url-gen";

/**
 * Instância central do Cloudinary, configurada via variável de ambiente.
 * Segue o mesmo padrão de "degrade com segurança" do core/firebase: se a
 * cloud name não estiver configurada (ex.: ambiente local sem .env), a
 * instância fica null e o restante da aplicação continua funcionando com
 * as URLs de mídia já existentes (picsum, links externos, etc.).
 *
 * Configuração esperada (.env):
 *   VITE_CLOUDINARY_CLOUD_NAME=seu-cloud-name
 */
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const cld = cloudName
  ? new Cloudinary({ cloud: { cloudName }, url: { secure: true } })
  : null;
