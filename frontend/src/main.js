import "@/style.css";
import { Router } from "@/app/router/router";
import { applyPreferences } from "@/app/preferences/preferences";

applyPreferences();
Router.inicializar();
