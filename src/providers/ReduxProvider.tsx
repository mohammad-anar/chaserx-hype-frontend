"use client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "@/redux/store";
import { Toaster } from "sonner";
import GlobalLoader from "@/components/GlobalLoader";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={<GlobalLoader />} persistor={persistor}>
                {children}
                <Toaster />
            </PersistGate>
        </Provider>
    );
}

