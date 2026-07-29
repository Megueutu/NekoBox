import "@/style.css";
import { Router } from "@/app/router/router";
import { applyPreferences } from "@/app/preferences/preferences";
import { setupWalletDialog } from "@/components/wallet/WalletDialog";
import { setupMediaFallbacks } from "@/utils/media-fallback";
import { setupAuthDialog } from "@/components/auth/AuthDialog";
import { setupChatbot } from "@/components/chat/Chatbot";

applyPreferences();
setupWalletDialog();
setupMediaFallbacks();
setupAuthDialog();
setupChatbot();
Router.inicializar();
