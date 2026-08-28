import { type Href, router } from "expo-router";



export const createAuthNavigate =
     (onTask: (msg: string) => void) => ({ session, decorateUrl }: any) => {
          if (session?.currentTask) {
               onTask("Your account needs aditional step to finish sign in.");
               return;
          }
          const url = decorateUrl("/(tabs)");
          if (url.startsWith("http")) {
               if (typeof window !== "undefined" && window.location) {
                    window.location.href = url;
               } else {
                    router.replace("/(tabs)" as Href);
               }
          } else {
               router.replace(url as Href);
          }
     };