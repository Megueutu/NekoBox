import "@/style.css";
import { inicializar } from "@/app/router/router";
import { setupWalletDialog } from "@/components/WalletDialog";
import { setupMediaFallbacks } from "@/utils/media-fallback";
import { setupAuthDialog } from "@/components/AuthDialog";
import { setupChatbot } from "@/components/Chatbot";

setupWalletDialog();
setupMediaFallbacks();
setupAuthDialog();
setupChatbot();
inicializar();
