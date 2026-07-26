import "@/style.css";
import { Router } from "@/app/router/router";
import { applyPreferences } from "@/app/preferences/preferences";
import { setupWalletDialog } from "@/components/wallet/WalletDialog";
import { setupMediaFallbacks } from "@/utils/media-fallback";

applyPreferences();
setupWalletDialog();
setupMediaFallbacks();
Router.inicializar();
